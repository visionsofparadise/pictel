/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function computeTierBuffer(pixels: ImageData, bands: number): { tierBuffer: ImageData; tierValues: Array<number> } {
	const src = pixels.data
	const length = src.length
	const tierData = new Uint8ClampedArray(length)
	const clampedBands = Math.max(2, bands)
	const steps = clampedBands - 1
	const stepScale = 255 / steps
	const lumScratch = new Uint8ClampedArray(1)

	for (let px = 0; px < length; px += 4) {
		// Match the original two-pass behavior: lum is first written through a
		// Uint8ClampedArray (round-half-to-even) by applyGrayscale, then read
		// back as an integer by applyPosterize. Routing through a 1-byte scratch
		// preserves that intermediate-rounding step so output bytes stay
		// bit-identical to the prior `applyGrayscale → applyPosterize` chain.
		lumScratch[0] = 0.299 * src[px]! + 0.587 * src[px + 1]! + 0.114 * src[px + 2]!
		const lum = lumScratch[0]
		const quant = Math.round((lum / 255) * steps) * stepScale

		tierData[px] = quant
		tierData[px + 1] = quant
		tierData[px + 2] = quant
		tierData[px + 3] = src[px + 3]!
	}

	const tierBuffer = new ImageData(tierData, pixels.width, pixels.height)
	const tierValues: Array<number> = []
	const denom = Math.max(1, bands - 1)

	for (let bandIdx = 0; bandIdx < bands; bandIdx++) {
		tierValues.push(Math.round((255 * bandIdx) / denom))
	}

	return { tierBuffer, tierValues }
}
/* eslint-enable @typescript-eslint/no-non-null-assertion */
