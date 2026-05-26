import type { EffectResult } from "pictel"
import { boxRadiiForGaussian } from "./Blur"
import { padImageData } from "./utils/pad-image-data"
import {
	applySeparableBlurGpu,
	type SeparableBlurInput,
} from "./utils/applySeparableBlurGpu"
import { discardCachedAdapter, requireWebGPU } from "../webgpu"

// WebGPU `copyTextureToBuffer` requires bytesPerRow to be a multiple of 256.
const COPY_BYTES_PER_ROW_ALIGNMENT = 256

/**
 * GPU-accelerated counterpart to `applyUniformBlur`. Mirrors the CPU peer's
 * three-pass box-blur approximation of a Gaussian (using `boxRadiiForGaussian`)
 * so output dimensions and overflow match exactly; per-pixel values match
 * within float-precision tolerance.
 *
 * Throws if WebGPU is unavailable. No CPU fallback — use `applyUniformBlur`
 * when WebGPU support isn't guaranteed.
 */
export async function applyBlurGpu(
	pixels: ImageData,
	radius: number,
): Promise<EffectResult> {
	const blurRadius = Math.round(radius)

	if (blurRadius <= 0) {
		return { pixels, overflow: { top: 0, right: 0, bottom: 0, left: 0 } }
	}

	// Acquire device FIRST so a WebGPU-unavailable environment fails fast
	// before any CPU-side padding work. Mirrors the consume/retry pattern in
	// applyBilateralGpu.
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
		// Pad the source to match the CPU peer's output dimensions and
		// clamp-to-edge boundary behavior. The helper's shader already clamps
		// to edge, but padding the input also expands the canvas to hold the
		// blur halo, which is what `applyUniformBlur` does.
		const padded = padImageData(pixels, blurRadius, blurRadius, blurRadius, blurRadius)
		const outW = padded.width
		const outH = padded.height

		// Upload the padded ImageData as a single rgba8unorm texture.
		const srcTexture = device.createTexture({
			size: { width: outW, height: outH },
			format: "rgba8unorm",
			usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
		})

		device.queue.writeTexture(
			{ texture: srcTexture },
			padded.data,
			{ bytesPerRow: outW * 4, rowsPerImage: outH },
			{ width: outW, height: outH },
		)

		const radii = boxRadiiForGaussian(blurRadius)

		// Run three box blurs (matching the CPU peer's Gaussian approximation),
		// chaining the output of each into the input of the next. Skip radii
		// that round to zero (boxRadiiForGaussian returns 0 for tiny inputs).
		let currentInput: SeparableBlurInput = {
			texture: srcTexture,
			view: srcTexture.createView(),
		}

		const intermediateTextures: Array<GPUTexture> = []

		for (const passRadius of radii) {
			if (passRadius <= 0) continue

			const [blurred] = await applySeparableBlurGpu(
				[currentInput],
				passRadius,
				device,
			)

			if (blurred === undefined) {
				throw new Error("applyBlurGpu: separable helper returned no texture")
			}

			// The previous intermediate (not the original source) is no longer
			// needed once the next pass has read it. Schedule destruction at
			// end of call rather than mid-loop to keep the encoder hot.
			if (currentInput.texture !== srcTexture) {
				intermediateTextures.push(currentInput.texture)
			}

			currentInput = { texture: blurred, view: blurred.createView() }
		}

		// Readback: COPY_SRC texture → MAP_READ buffer, padded to 256 bytes/row.
		const unpaddedBytesPerRow = outW * 4
		const paddedBytesPerRow =
			Math.ceil(unpaddedBytesPerRow / COPY_BYTES_PER_ROW_ALIGNMENT) *
			COPY_BYTES_PER_ROW_ALIGNMENT

		const readbackBuffer = device.createBuffer({
			size: paddedBytesPerRow * outH,
			usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
		})

		const encoder = device.createCommandEncoder()
		encoder.copyTextureToBuffer(
			{ texture: currentInput.texture },
			{
				buffer: readbackBuffer,
				bytesPerRow: paddedBytesPerRow,
				rowsPerImage: outH,
			},
			{ width: outW, height: outH },
		)
		device.queue.submit([encoder.finish()])

		await readbackBuffer.mapAsync(GPUMapMode.READ)
		const mapped = readbackBuffer.getMappedRange()
		const output = new Uint8ClampedArray(outW * outH * 4)

		if (paddedBytesPerRow === unpaddedBytesPerRow) {
			output.set(new Uint8Array(mapped))
		} else {
			const paddedView = new Uint8Array(mapped)

			for (let row = 0; row < outH; row++) {
				const srcOffset = row * paddedBytesPerRow
				const dstOffset = row * unpaddedBytesPerRow
				output.set(
					paddedView.subarray(srcOffset, srcOffset + unpaddedBytesPerRow),
					dstOffset,
				)
			}
		}

		readbackBuffer.unmap()

		// Clean up GPU resources. The final blur output texture lives in
		// `currentInput.texture` and is not the original `srcTexture`.
		srcTexture.destroy()

		if (currentInput.texture !== srcTexture) {
			currentInput.texture.destroy()
		}

		for (const intermediate of intermediateTextures) {
			intermediate.destroy()
		}

		readbackBuffer.destroy()

		return {
			pixels: new ImageData(output, outW, outH),
			overflow: {
				top: blurRadius,
				right: blurRadius,
				bottom: blurRadius,
				left: blurRadius,
			},
		}
	} finally {
		device.destroy()
	}
}
