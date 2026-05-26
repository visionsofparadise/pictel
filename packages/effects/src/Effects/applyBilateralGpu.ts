import { discardCachedAdapter, requireWebGPU } from "../webgpu"
import shaderSrc from "./bilateral-gpu.wgsl?raw"

// WebGPU requires `bytesPerRow` for buffer-texture copies to be a multiple of
// 256 bytes. RGBA8 is 4 bytes/pixel, so widths whose row length isn't already
// a multiple of 256 need a padded readback buffer that we unpack at the end.
const COPY_BYTES_PER_ROW_ALIGNMENT = 256

const WORKGROUP_X = 8
const WORKGROUP_Y = 8

/**
 * GPU-accelerated bilateral filter. Matches the math of `applyBilateral` (the
 * CPU peer) within float-precision tolerance — at the eventual Uint8 output a
 * handful of pixels can differ by ±1 unit vs. the CPU implementation, which
 * is well below visible threshold.
 *
 * Throws if WebGPU is unavailable; the caller is responsible for surfacing the
 * error (typically via `RasterEffect`'s `reportError` path).
 *
 * Device creation happens per call. The adapter is cached at the
 * `requireWebGPU` module level; device creation itself is a few-ms operation
 * that's dominated by the actual filter dispatch + readback for the image
 * sizes pictel cares about.
 */
export async function applyBilateralGpu(
	pixels: ImageData,
	spatialSigma: number,
	colorSigma: number,
): Promise<ImageData> {
	const { width, height, data: src } = pixels

	// `requestDevice` consumes the adapter; a cached adapter from a previous
	// call will throw on a second `requestDevice`. On that failure, discard
	// the cache and retry once with a freshly-requested adapter.
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
		const radius = Math.max(0, Math.ceil(spatialSigma * 2))
		const spatialDenom = 2 * spatialSigma * spatialSigma
		const colorDenom = 2 * colorSigma * colorSigma

		// --- Source texture upload ---
		const srcTex = device.createTexture({
			size: { width, height },
			format: "rgba8unorm",
			usage:
				GPUTextureUsage.TEXTURE_BINDING |
				GPUTextureUsage.COPY_DST,
		})

		// `writeTexture` handles row-padding internally — we pass the tight
		// per-row stride of the source ImageData.
		device.queue.writeTexture(
			{ texture: srcTex },
			src,
			{ bytesPerRow: width * 4, rowsPerImage: height },
			{ width, height },
		)

		// --- Destination storage texture ---
		const dstTex = device.createTexture({
			size: { width, height },
			format: "rgba8unorm",
			usage:
				GPUTextureUsage.STORAGE_BINDING |
				GPUTextureUsage.COPY_SRC,
		})

		// --- Uniforms ---
		// Layout (32 bytes — std140-friendly with three 4-byte trailing pads):
		//   f32 spatialDenom
		//   f32 colorDenom
		//   i32 radius
		//   i32 width
		//   i32 height
		//   f32 _pad0, _pad1, _pad2
		const uniformBuffer = device.createBuffer({
			size: 32,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		})
		const uniformArrayBuffer = new ArrayBuffer(32)
		const uniformFloats = new Float32Array(uniformArrayBuffer)
		const uniformInts = new Int32Array(uniformArrayBuffer)
		uniformFloats[0] = spatialDenom
		uniformFloats[1] = colorDenom
		uniformInts[2] = radius
		uniformInts[3] = width
		uniformInts[4] = height
		device.queue.writeBuffer(uniformBuffer, 0, uniformArrayBuffer)

		// --- Pipeline ---
		const shaderModule = device.createShaderModule({ code: shaderSrc })

		const bindGroupLayout = device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.COMPUTE,
					texture: { sampleType: "float" },
				},
				{
					binding: 1,
					visibility: GPUShaderStage.COMPUTE,
					storageTexture: { access: "write-only", format: "rgba8unorm" },
				},
				{
					binding: 2,
					visibility: GPUShaderStage.COMPUTE,
					buffer: { type: "uniform" },
				},
			],
		})

		const pipeline = device.createComputePipeline({
			layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
			compute: { module: shaderModule, entryPoint: "main" },
		})

		const bindGroup = device.createBindGroup({
			layout: bindGroupLayout,
			entries: [
				{ binding: 0, resource: srcTex.createView() },
				{ binding: 1, resource: dstTex.createView() },
				{ binding: 2, resource: { buffer: uniformBuffer } },
			],
		})

		// --- Readback buffer (padded to 256 bytes/row) ---
		const unpaddedBytesPerRow = width * 4
		const paddedBytesPerRow =
			Math.ceil(unpaddedBytesPerRow / COPY_BYTES_PER_ROW_ALIGNMENT) *
			COPY_BYTES_PER_ROW_ALIGNMENT
		const readbackBuffer = device.createBuffer({
			size: paddedBytesPerRow * height,
			usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
		})

		// --- Dispatch ---
		const encoder = device.createCommandEncoder()
		const pass = encoder.beginComputePass()
		pass.setPipeline(pipeline)
		pass.setBindGroup(0, bindGroup)
		pass.dispatchWorkgroups(
			Math.ceil(width / WORKGROUP_X),
			Math.ceil(height / WORKGROUP_Y),
		)
		pass.end()

		encoder.copyTextureToBuffer(
			{ texture: dstTex },
			{ buffer: readbackBuffer, bytesPerRow: paddedBytesPerRow, rowsPerImage: height },
			{ width, height },
		)

		device.queue.submit([encoder.finish()])

		// --- Map and unpack ---
		await readbackBuffer.mapAsync(GPUMapMode.READ)
		const mapped = readbackBuffer.getMappedRange()
		const output = new Uint8ClampedArray(width * height * 4)

		if (paddedBytesPerRow === unpaddedBytesPerRow) {
			output.set(new Uint8Array(mapped))
		} else {
			// Per-row copy to strip the trailing pad bytes.
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

		// Destroy GPU resources eagerly — they'd be GC'd anyway but explicit
		// release helps long-running pages avoid VRAM accumulation.
		srcTex.destroy()
		dstTex.destroy()
		uniformBuffer.destroy()
		readbackBuffer.destroy()

		return new ImageData(output, width, height)
	} finally {
		device.destroy()
	}
}
