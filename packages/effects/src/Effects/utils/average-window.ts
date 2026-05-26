import { sampleWindow } from "./sample-window"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

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
