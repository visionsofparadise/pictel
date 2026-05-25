import { applyGrayscale } from "../Grayscale"
import { applyPosterize } from "../Posterize"

/**
 * Build the per-pixel tier index buffer (0..bands-1) by applying Grayscale
 * then Posterize and reading back the quantized R channel. Each pixel's tier
 * value is `Math.round(255 * b / (bands - 1))` for tier index b — matches the
 * Posterize quantization formula exactly.
 */
export function computeTierBuffer(pixels: ImageData, bands: number): { tierBuffer: ImageData; tierValues: Array<number> } {
	const grayBuffer = applyGrayscale(pixels, 1)
	const tierBuffer = applyPosterize(grayBuffer, bands)
	const tierValues: Array<number> = []
	const denom = Math.max(1, bands - 1)

	for (let bandIdx = 0; bandIdx < bands; bandIdx++) {
		tierValues.push(Math.round((255 * bandIdx) / denom))
	}

	return { tierBuffer, tierValues }
}
