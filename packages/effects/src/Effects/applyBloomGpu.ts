import { normalizeResult } from "pictel"
import { applyBlurGpu } from "./applyBlurGpu"
import { luminance } from "./utils/luminance"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * GPU-accelerated counterpart to `applyBloom`. Highlight extraction and final
 * screen-blend composite stay on CPU; the blur-of-highlights step (the
 * dominant cost at large radius) runs on GPU via `applyBlurGpu`.
 *
 * Throws if WebGPU is unavailable.
 */
export async function applyBloomGpu(
	pixels: ImageData,
	threshold: number,
	radius: number,
	intensity: number,
): Promise<ImageData> {
	const width = pixels.width
	const height = pixels.height
	const src = pixels.data

	const range = 1 - threshold
	const highlightData = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const red = src[px]!
		const green = src[px + 1]!
		const blue = src[px + 2]!

		const lum = luminance(red, green, blue) / 255
		const knee = range > 0 ? Math.max(0, Math.min(1, (lum - threshold) / range)) : lum >= threshold ? 1 : 0
		const weight = knee * knee

		highlightData[px] = red * weight
		highlightData[px + 1] = green * weight
		highlightData[px + 2] = blue * weight
		highlightData[px + 3] = 255
	}

	const highlights = new ImageData(highlightData, width, height)

	const blurred = normalizeResult(await applyBlurGpu(highlights, radius))
	const blurData = blurred.pixels.data
	const blurW = blurred.pixels.width
	const ox = blurred.overflow.left
	const oy = blurred.overflow.top

	const output = new Uint8ClampedArray(src.length)

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const srcIdx = (y * width + x) * 4
			const blurIdx = ((y + oy) * blurW + (x + ox)) * 4

			for (let ch = 0; ch < 3; ch++) {
				const base = src[srcIdx + ch]!
				const bloom = Math.min(255, blurData[blurIdx + ch]! * intensity)
				output[srcIdx + ch] = 255 - ((255 - base) * (255 - bloom)) / 255
			}

			output[srcIdx + 3] = src[srcIdx + 3]!
		}
	}

	return new ImageData(output, width, height)
}

export async function applyMappedBloomGpu(
	pixels: ImageData,
	map: ImageData,
	threshold: number,
	radius: number,
	intensity: number,
): Promise<ImageData> {
	const bloomed = await applyBloomGpu(pixels, threshold, radius, intensity)

	return mixBlend(pixels, bloomed, map)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */
