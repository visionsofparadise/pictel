import { discardCachedAdapter, requireWebGPU } from "../webgpu"
import { applySeparableBlurGpu } from "./utils/applySeparableBlurGpu"
import shockShaderSrc from "./shock-filter-step-gpu.wgsl?raw"

// WebGPU `copyTextureToBuffer` requires bytesPerRow to be a multiple of 256.
const COPY_BYTES_PER_ROW_ALIGNMENT = 256

/**
 * GPU-accelerated counterpart to `applyShockFilter`. The iteration loop stays
 * entirely on GPU: each iteration runs (a) one separable-blur pass via the
 * shared helper (radius 1, "smoothing") and (b) one shock-step compute that
 * reads the smoothed lum field + the pre-smoothing state and writes the
 * post-shock state into a ping-pong texture. No CPU readback between
 * iterations — only one upload at start and one readback at end. This is
 * Phase 22.4's headline ShockFilter win.
 *
 * Throws if WebGPU is unavailable.
 */
export async function applyShockFilterGpu(
	pixels: ImageData,
	iterations: number,
	strength: number,
): Promise<ImageData> {
	const { width, height, data: src } = pixels
	const passes = Math.max(0, Math.floor(iterations))

	if (passes === 0) {
		return new ImageData(new Uint8ClampedArray(src), width, height)
	}

	const dt = Math.min(1, strength)

	// Acquire device. Mirrors the consume/retry pattern in applyBilateralGpu.
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
		// Two ping-pong state textures: `state` holds the current channels;
		// each iteration's shock-step writes into `nextState` then swaps.
		const stateTextureDesc: GPUTextureDescriptor = {
			size: { width, height },
			format: "rgba8unorm",
			usage:
				GPUTextureUsage.TEXTURE_BINDING |
				GPUTextureUsage.STORAGE_BINDING |
				GPUTextureUsage.COPY_DST |
				GPUTextureUsage.COPY_SRC,
		}

		let stateTex = device.createTexture(stateTextureDesc)
		let nextStateTex = device.createTexture(stateTextureDesc)

		device.queue.writeTexture(
			{ texture: stateTex },
			src,
			{ bytesPerRow: width * 4, rowsPerImage: height },
			{ width, height },
		)

		// Shock-step shader: reads (state, smoothed) → writes nextState.
		const shockModule = device.createShaderModule({ code: shockShaderSrc })
		const shockBindGroupLayout = device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.COMPUTE,
					texture: { sampleType: "float" },
				},
				{
					binding: 1,
					visibility: GPUShaderStage.COMPUTE,
					texture: { sampleType: "float" },
				},
				{
					binding: 2,
					visibility: GPUShaderStage.COMPUTE,
					storageTexture: { access: "write-only", format: "rgba8unorm" },
				},
				{
					binding: 3,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: "uniform" },
				},
			],
		})
		const shockPipeline = device.createComputePipeline({
			layout: device.createPipelineLayout({ bindGroupLayouts: [shockBindGroupLayout] }),
			compute: { module: shockModule, entryPoint: "main" },
		})

		const shockUniform = device.createBuffer({
			size: 16,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		})
		const uniformData = new ArrayBuffer(16)
		new Float32Array(uniformData)[0] = dt
		const uniformInts = new Int32Array(uniformData)
		uniformInts[1] = width
		uniformInts[2] = height
		uniformInts[3] = 0
		device.queue.writeBuffer(shockUniform, 0, uniformData)

		const dispatchX = Math.ceil(width / 8)
		const dispatchY = Math.ceil(height / 8)

		for (let pass = 0; pass < passes; pass++) {
			// (a) Smoothing blur — radius 1 separable box. The shared helper
			// returns a brand-new texture per call; we read it then destroy.
			const [smoothedTex] = await applySeparableBlurGpu(
				[{ texture: stateTex, view: stateTex.createView() }],
				1,
				device,
			)

			if (smoothedTex === undefined) {
				throw new Error("applyShockFilterGpu: separable helper returned no texture")
			}

			// (b) Shock step: (stateTex, smoothedTex) → nextStateTex.
			const shockBindGroup = device.createBindGroup({
				layout: shockBindGroupLayout,
				entries: [
					{ binding: 0, resource: stateTex.createView() },
					{ binding: 1, resource: smoothedTex.createView() },
					{ binding: 2, resource: nextStateTex.createView() },
					{ binding: 3, resource: { buffer: shockUniform } },
				],
			})

			const encoder = device.createCommandEncoder()
			const computePass = encoder.beginComputePass()
			computePass.setPipeline(shockPipeline)
			computePass.setBindGroup(0, shockBindGroup)
			computePass.dispatchWorkgroups(dispatchX, dispatchY)
			computePass.end()
			device.queue.submit([encoder.finish()])

			// Wait so the next iteration sees the writes. Without this the
			// next applySeparableBlurGpu call could be enqueued before the
			// shock-step writes are visible; WebGPU's queue semantics
			// generally serialize on the same queue, but the helper also
			// awaits onSubmittedWorkDone internally — be explicit here.
			await device.queue.onSubmittedWorkDone()

			// Done with smoothed; swap state ↔ next.
			smoothedTex.destroy()

			const previous = stateTex
			stateTex = nextStateTex
			nextStateTex = previous
		}

		// Readback the final state texture.
		const unpaddedBytesPerRow = width * 4
		const paddedBytesPerRow =
			Math.ceil(unpaddedBytesPerRow / COPY_BYTES_PER_ROW_ALIGNMENT) *
			COPY_BYTES_PER_ROW_ALIGNMENT

		const readbackBuffer = device.createBuffer({
			size: paddedBytesPerRow * height,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
		})

		const encoder = device.createCommandEncoder()
		encoder.copyTextureToBuffer(
			{ texture: stateTex },
			{ buffer: readbackBuffer, bytesPerRow: paddedBytesPerRow, rowsPerImage: height },
			{ width, height },
		)
		device.queue.submit([encoder.finish()])

		await readbackBuffer.mapAsync(GPUMapMode.READ)
		const mapped = readbackBuffer.getMappedRange()
		const output = new Uint8ClampedArray(width * height * 4)

		if (paddedBytesPerRow === unpaddedBytesPerRow) {
			output.set(new Uint8Array(mapped))
		} else {
			const paddedView = new Uint8Array(mapped)

			for (let row = 0; row < height; row++) {
				const srcOffset = row * paddedBytesPerRow
				const dstOffset = row * unpaddedBytesPerRow
				output.set(
					paddedView.subarray(srcOffset, srcOffset + unpaddedBytesPerRow),
					dstOffset,
				)
			}
		}

		readbackBuffer.unmap()

		stateTex.destroy()
		nextStateTex.destroy()
		readbackBuffer.destroy()
		shockUniform.destroy()

		return new ImageData(output, width, height)
	} finally {
		device.destroy()
	}
}
