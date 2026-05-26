import { normalizeResult } from "pictel"
import { applyBlurGpu } from "./applyBlurGpu"
import { luminance } from "./utils/luminance"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

const TAU = 0.98

/**
 * GPU-accelerated counterpart to `applyOutline` (XDoG). The two Gaussian
 * blurs at σ and k·σ — the dominant cost — run on GPU via `applyBlurGpu`.
 * Luminance pack and the XDoG sigmoid combine stay on CPU.
 *
 * Throws if WebGPU is unavailable.
 */
export async function applyOutlineGpu(
	pixels: ImageData,
	sigma: number,
	kappa: number,
	epsilon: number,
	phi: number,
): Promise<ImageData> {
	const width = pixels.width
	const height = pixels.height
	const src = pixels.data

	const lumData = new Uint8ClampedArray(width * height * 4)

	for (let px = 0; px < src.length; px += 4) {
		const lum = luminance(src[px]!, src[px + 1]!, src[px + 2]!)
		const rounded = Math.round(lum)
		lumData[px] = rounded
		lumData[px + 1] = rounded
		lumData[px + 2] = rounded
		lumData[px + 3] = 255
	}

	const lumImage = new ImageData(lumData, width, height)

	// Two GPU blurs at different radii. The shared helper handles cascading
	// natively by accepting different `radius` arguments per call (Phase 22's
	// "Outline cascades two blur passes; shared helper handles that natively"
	// — each call's internal three-box-pass approximation drives the cascade).
	const blur1 = normalizeResult(await applyBlurGpu(lumImage, sigma))
	const blur2 = normalizeResult(await applyBlurGpu(lumImage, sigma * kappa))

	const buf1 = blur1.pixels.data
	const w1 = blur1.pixels.width
	const ox1 = blur1.overflow.left
	const oy1 = blur1.overflow.top

	const buf2 = blur2.pixels.data
	const w2 = blur2.pixels.width
	const ox2 = blur2.overflow.left
	const oy2 = blur2.overflow.top

	const output = new Uint8ClampedArray(src.length)

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const srcIdx = (y * width + x) * 4
			const idx1 = ((y + oy1) * w1 + (x + ox1)) * 4
			const idx2 = ((y + oy2) * w2 + (x + ox2)) * 4

			const g1 = buf1[idx1]!
			const g2 = buf2[idx2]!

			const xdog = ((1 + TAU) * g1 - TAU * g2) / 255

			let value: number

			if (xdog >= epsilon) {
				value = 255
			} else {
				value = 255 * (1 + Math.tanh(phi * (xdog - epsilon)))
			}

			const clamped = Math.max(0, Math.min(255, value))

			output[srcIdx] = clamped
			output[srcIdx + 1] = clamped
			output[srcIdx + 2] = clamped
			output[srcIdx + 3] = src[srcIdx + 3]!
		}
	}

	return new ImageData(output, width, height)
}

export async function applyMappedOutlineGpu(
	pixels: ImageData,
	map: ImageData,
	sigma: number,
	kappa: number,
	epsilon: number,
	phi: number,
): Promise<ImageData> {
	const outlined = await applyOutlineGpu(pixels, sigma, kappa, epsilon, phi)

	return mixBlend(pixels, outlined, map)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */
