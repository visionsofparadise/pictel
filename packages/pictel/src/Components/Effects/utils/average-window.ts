import { sampleWindow } from "./sample-window"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * Average a per-pixel scalar over the `dotSize`-wide window centered on a
 * source-space point, clamped to image bounds. `sample(offset)` reads the
 * scalar in [0, 1] at the given byte offset. Returns `null` when the window
 * falls entirely outside the source.
 */
export function averageCoverage(
	width: number,
	height: number,
	sourceCx: number,
	sourceCy: number,
	half: number,
	sample: (offset: number) => number,
): number | null {
	const { startX, startY, endX, endY } = sampleWindow(width, height, sourceCx, sourceCy, half)

	let sum = 0
	let count = 0

	for (let pixelY = startY; pixelY < endY; pixelY++) {
		for (let pixelX = startX; pixelX < endX; pixelX++) {
			const offset = (pixelY * width + pixelX) * 4
			sum += sample(offset)
			count++
		}
	}

	if (count === 0) return null

	return sum / count
}

/**
 * Average the source RGB over the `dotSize`-wide window centered on a
 * source-space point, clamped to image bounds. Returns an `[r, g, b]` tuple
 * (each in [0, 255]), or `null` when the window falls entirely outside the
 * source.
 */
export function averageColor(
	width: number,
	height: number,
	sourceCx: number,
	sourceCy: number,
	half: number,
	src: Uint8ClampedArray,
): [number, number, number] | null {
	const { startX, startY, endX, endY } = sampleWindow(width, height, sourceCx, sourceCy, half)

	let sumR = 0
	let sumG = 0
	let sumB = 0
	let count = 0

	for (let pixelY = startY; pixelY < endY; pixelY++) {
		for (let pixelX = startX; pixelX < endX; pixelX++) {
			const offset = (pixelY * width + pixelX) * 4
			sumR += src[offset]!
			sumG += src[offset + 1]!
			sumB += src[offset + 2]!
			count++
		}
	}

	if (count === 0) return null

	return [sumR / count, sumG / count, sumB / count]
}
