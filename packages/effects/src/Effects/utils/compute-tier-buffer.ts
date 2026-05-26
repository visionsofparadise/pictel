import { applyGrayscale } from "../Grayscale"
import { applyPosterize } from "../Posterize"

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
