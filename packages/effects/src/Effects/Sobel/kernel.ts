import { luminance } from "../utils/luminance"

export const SOBEL_X = [-1, 0, 1, -2, 0, 2, -1, 0, 1] as const

export const SOBEL_Y = [-1, -2, -1, 0, 0, 0, 1, 2, 1] as const

export const SCHARR_X = [-3, 0, 3, -10, 0, 10, -3, 0, 3] as const

export const SCHARR_Y = [-3, -10, -3, 0, 0, 0, 3, 10, 3] as const

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applyKernels(
	pixels: ImageData,
	kernelX: ReadonlyArray<number>,
	kernelY: ReadonlyArray<number>,
): { gx: Float32Array; gy: Float32Array; maxResponse: number } {
	const { width, height, data } = pixels
	const gx = new Float32Array(width * height)
	const gy = new Float32Array(width * height)

	let positiveSum = 0

	for (const value of kernelX) {
		if (value > 0) positiveSum += value
	}

	const maxResponse = Math.SQRT2 * positiveSum * 255

	for (let y = 1; y < height - 1; y++) {
		for (let x = 1; x < width - 1; x++) {
			let sumX = 0
			let sumY = 0
			let kernelIdx = 0

			for (let ky = -1; ky <= 1; ky++) {
				for (let kx = -1; kx <= 1; kx++) {
					const sampleIdx = ((y + ky) * width + (x + kx)) * 4
					const lum = luminance(
						data[sampleIdx]!,
						data[sampleIdx + 1]!,
						data[sampleIdx + 2]!,
					)
					sumX += kernelX[kernelIdx]! * lum
					sumY += kernelY[kernelIdx]! * lum
					kernelIdx++
				}
			}

			const pixelIdx = y * width + x
			gx[pixelIdx] = sumX
			gy[pixelIdx] = sumY
		}
	}

	return { gx, gy, maxResponse }
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */
