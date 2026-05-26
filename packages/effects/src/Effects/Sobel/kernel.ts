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

	const kx0 = kernelX[0]!
	const kx1 = kernelX[1]!
	const kx2 = kernelX[2]!
	const kx3 = kernelX[3]!
	const kx4 = kernelX[4]!
	const kx5 = kernelX[5]!
	const kx6 = kernelX[6]!
	const kx7 = kernelX[7]!
	const kx8 = kernelX[8]!
	const ky0 = kernelY[0]!
	const ky1 = kernelY[1]!
	const ky2 = kernelY[2]!
	const ky3 = kernelY[3]!
	const ky4 = kernelY[4]!
	const ky5 = kernelY[5]!
	const ky6 = kernelY[6]!
	const ky7 = kernelY[7]!
	const ky8 = kernelY[8]!

	for (let y = 1; y < height - 1; y++) {
		const rowUp = (y - 1) * width
		const rowMid = y * width
		const rowDown = (y + 1) * width

		for (let x = 1; x < width - 1; x++) {
			const idx00 = (rowUp + (x - 1)) * 4
			const idx01 = (rowUp + x) * 4
			const idx02 = (rowUp + (x + 1)) * 4
			const idx10 = (rowMid + (x - 1)) * 4
			const idx11 = (rowMid + x) * 4
			const idx12 = (rowMid + (x + 1)) * 4
			const idx20 = (rowDown + (x - 1)) * 4
			const idx21 = (rowDown + x) * 4
			const idx22 = (rowDown + (x + 1)) * 4

			const lum00 = luminance(data[idx00]!, data[idx00 + 1]!, data[idx00 + 2]!)
			const lum01 = luminance(data[idx01]!, data[idx01 + 1]!, data[idx01 + 2]!)
			const lum02 = luminance(data[idx02]!, data[idx02 + 1]!, data[idx02 + 2]!)
			const lum10 = luminance(data[idx10]!, data[idx10 + 1]!, data[idx10 + 2]!)
			const lum11 = luminance(data[idx11]!, data[idx11 + 1]!, data[idx11 + 2]!)
			const lum12 = luminance(data[idx12]!, data[idx12 + 1]!, data[idx12 + 2]!)
			const lum20 = luminance(data[idx20]!, data[idx20 + 1]!, data[idx20 + 2]!)
			const lum21 = luminance(data[idx21]!, data[idx21 + 1]!, data[idx21 + 2]!)
			const lum22 = luminance(data[idx22]!, data[idx22 + 1]!, data[idx22 + 2]!)

			const sumX =
				kx0 * lum00 +
				kx1 * lum01 +
				kx2 * lum02 +
				kx3 * lum10 +
				kx4 * lum11 +
				kx5 * lum12 +
				kx6 * lum20 +
				kx7 * lum21 +
				kx8 * lum22
			const sumY =
				ky0 * lum00 +
				ky1 * lum01 +
				ky2 * lum02 +
				ky3 * lum10 +
				ky4 * lum11 +
				ky5 * lum12 +
				ky6 * lum20 +
				ky7 * lum21 +
				ky8 * lum22

			const pixelIdx = rowMid + x
			gx[pixelIdx] = sumX
			gy[pixelIdx] = sumY
		}
	}

	return { gx, gy, maxResponse }
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */
