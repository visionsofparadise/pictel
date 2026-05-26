import { discardCachedAdapter, requireWebGPU } from "../webgpu"
import shaderSrc from "./lic-gpu.wgsl?raw"

// WebGPU-backed Line Integral Convolution. Drop-in replacement for the CPU
// peer's `applyLIC` signature plus an awaitable Promise return — same field
// encoding (Direction-style cos/sin/magnitude packed into RGB), same weight
// ramp (1 - step / length), same forward+backward integration, same boundary
// behaviour (clamp-to-edge). The GPU win is hardware bilinear: the CPU peer's
// `sampleBilinear` (4 lookups + 6 lerps per sample, called ~80 times per
// pixel at length=20) becomes one `textureSampleLevel` per sample, with the
// per-pixel work parallelized across the workgroup grid.
//
// Throws if WebGPU is unavailable. No CPU fallback — the CPU peer (`applyLIC`)
// is the universal-support choice; this function is gated to GPU consumers.
// Pattern matches @pictel/ml's "throw on no-WebGPU" surface — see
// design-performance.md "GPU effects — colocated, GPU-only, throws on
// unavailable".

export async function applyLicGpu(
	seed: ImageData,
	field: ImageData,
	length: number,
	stepSize: number,
	uniformStep = false,
): Promise<ImageData> {
	if (seed.width !== field.width || seed.height !== field.height) {
		throw new Error(
			`applyLicGpu: seed and field dimensions must match (seed=${String(seed.width)}x${String(seed.height)}, field=${String(field.width)}x${String(field.height)})`,
		)
	}

	if (length <= 0) {
		throw new Error(`applyLicGpu: length must be > 0 (got ${String(length)})`)
	}

	const { width, height } = seed

	// `requestDevice` consumes the adapter; a cached adapter from a previous
	// call will throw on a second `requestDevice`. On that failure, discard
	// the cache and retry once with a freshly-requested adapter — same pattern
	// as `applyBilateralGpu`.
	let adapter = await requireWebGPU()
	let device: GPUDevice

	try {
		device = await adapter.requestDevice()
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)

		if (/consumed|already/i.test(message)) {
			discardCachedAdapter()
			adapter = await requireWebGPU()
			device = await adapter.requestDevice()
		} else {
			throw error
		}
	}

	try {
		const module = device.createShaderModule({ code: shaderSrc })

		const sampler = device.createSampler({
			addressModeU: "clamp-to-edge",
			addressModeV: "clamp-to-edge",
			magFilter: "linear",
			minFilter: "linear",
			mipmapFilter: "nearest",
		})

		const seedTexture = device.createTexture({
			size: { width, height },
			format: "rgba8unorm",
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
		})
		const fieldTexture = device.createTexture({
			size: { width, height },
			format: "rgba8unorm",
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
		})
		const outputTexture = device.createTexture({
			size: { width, height },
			format: "rgba8unorm",
			usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC,
		})

		device.queue.writeTexture(
			{ texture: seedTexture },
			seed.data,
			{ bytesPerRow: width * 4, rowsPerImage: height },
			{ width, height },
		)
		device.queue.writeTexture(
			{ texture: fieldTexture },
			field.data,
			{ bytesPerRow: width * 4, rowsPerImage: height },
			{ width, height },
		)

		// Uniform layout matches the WGSL `Params` struct: 4 u32 + 1 f32 + 1
		// u32 + 1 u32 pad = 24 bytes (round up to 32 for std140-ish alignment).
		const uniformBuffer = device.createBuffer({
			size: 32,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		})
		const uniformData = new ArrayBuffer(32)
		const uniformU32 = new Uint32Array(uniformData)
		const uniformF32 = new Float32Array(uniformData)
		uniformU32[0] = width
		uniformU32[1] = height
		uniformU32[2] = Math.max(1, Math.floor(length))
		uniformF32[3] = stepSize
		uniformU32[4] = uniformStep ? 1 : 0
		uniformU32[5] = 0
		device.queue.writeBuffer(uniformBuffer, 0, uniformData)

		const pipeline = device.createComputePipeline({
			layout: "auto",
			compute: { module, entryPoint: "main" },
		})

		const bindGroup = device.createBindGroup({
			layout: pipeline.getBindGroupLayout(0),
			entries: [
				{ binding: 0, resource: seedTexture.createView() },
				{ binding: 1, resource: fieldTexture.createView() },
				{ binding: 2, resource: sampler },
				{ binding: 3, resource: outputTexture.createView() },
				{ binding: 4, resource: { buffer: uniformBuffer } },
			],
		})

		const encoder = device.createCommandEncoder()
		const pass = encoder.beginComputePass()
		pass.setPipeline(pipeline)
		pass.setBindGroup(0, bindGroup)
		const workgroupsX = Math.ceil(width / 8)
		const workgroupsY = Math.ceil(height / 8)
		pass.dispatchWorkgroups(workgroupsX, workgroupsY, 1)
		pass.end()

		// Readback: COPY_SRC texture → COPY_DST/MAP_READ buffer. WebGPU
		// requires bytesPerRow to be a multiple of 256; pad if needed.
		const unpaddedBytesPerRow = width * 4
		const bytesPerRow = Math.ceil(unpaddedBytesPerRow / 256) * 256
		const readbackBuffer = device.createBuffer({
			size: bytesPerRow * height,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
		})
		encoder.copyTextureToBuffer(
			{ texture: outputTexture },
			{ buffer: readbackBuffer, bytesPerRow, rowsPerImage: height },
			{ width, height },
		)

		device.queue.submit([encoder.finish()])

		await readbackBuffer.mapAsync(GPUMapMode.READ)
		const mapped = new Uint8Array(readbackBuffer.getMappedRange())

		const output = new Uint8ClampedArray(width * height * 4)

		if (bytesPerRow === unpaddedBytesPerRow) {
			output.set(mapped.subarray(0, output.length))
		} else {
			for (let row = 0; row < height; row++) {
				const srcOffset = row * bytesPerRow
				const dstOffset = row * unpaddedBytesPerRow
				output.set(mapped.subarray(srcOffset, srcOffset + unpaddedBytesPerRow), dstOffset)
			}
		}

		readbackBuffer.unmap()
		readbackBuffer.destroy()
		seedTexture.destroy()
		fieldTexture.destroy()
		outputTexture.destroy()
		uniformBuffer.destroy()

		return new ImageData(output, width, height)
	} finally {
		device.destroy()
	}
}
