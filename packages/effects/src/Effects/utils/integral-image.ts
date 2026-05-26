/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * Summed-area table over an RGBA `ImageData`. Each entry in `sums` is the
 * cumulative sum of one channel from origin `(0, 0)` to `(x, y)` inclusive on
 * the right and bottom edges of a `(width + 1) × (height + 1)` grid (the first
 * row and column are zero so range queries don't need bounds checks).
 *
 * Per-cell sum of a half-open rectangle `[x1, x2) × [y1, y2)` for channel `c`:
 *
 * ```
 *   const i00 = (y1 * stride + x1) * 4 + c
 *   const i10 = (y1 * stride + x2) * 4 + c
 *   const i01 = (y2 * stride + x1) * 4 + c
 *   const i11 = (y2 * stride + x2) * 4 + c
 *   const sum = sums[i11]! - sums[i10]! - sums[i01]! + sums[i00]!
 * ```
 *
 * `stride` is `width + 1` — i.e. the row pitch of the table in pixel units
 * (multiply by 4 for the typed-array offset).
 *
 * `Float64Array` is required: cumulative byte sums over a 1024×1024 image
 * already reach ~268M, and a 4096×4096 region cleanly exceeds `2^31 - 1`. The
 * extra bits also let consumers compute per-cell averages by floating-point
 * division without precision loss accumulating across cells.
 */
export interface IntegralImage {
	sums: Float64Array
	width: number
	height: number
	stride: number
}

/**
 * Build a 4-channel summed-area table from an RGBA `ImageData`. Output is
 * sized `(width + 1) * (height + 1) * 4` with a leading zero row and column,
 * so a half-open rectangle `[x1, x2) × [y1, y2)` reads four corners directly
 * without conditional bounds clamping.
 */
export function buildIntegralImage(pixels: ImageData): IntegralImage {
	const { width, height, data: src } = pixels
	const stride = width + 1
	const sums = new Float64Array(stride * (height + 1) * 4)

	for (let y = 0; y < height; y++) {
		const rowSrcOffset = y * width * 4
		const rowOutOffset = (y + 1) * stride * 4
		const rowPrevOffset = y * stride * 4

		// Per-row running sum across the 4 channels.
		let sumR = 0
		let sumG = 0
		let sumB = 0
		let sumA = 0

		for (let x = 0; x < width; x++) {
			const srcOffset = rowSrcOffset + x * 4
			const outOffset = rowOutOffset + (x + 1) * 4
			const prevOffset = rowPrevOffset + (x + 1) * 4

			sumR += src[srcOffset]!
			sumG += src[srcOffset + 1]!
			sumB += src[srcOffset + 2]!
			sumA += src[srcOffset + 3]!

			sums[outOffset] = sums[prevOffset]! + sumR
			sums[outOffset + 1] = sums[prevOffset + 1]! + sumG
			sums[outOffset + 2] = sums[prevOffset + 2]! + sumB
			sums[outOffset + 3] = sums[prevOffset + 3]! + sumA
		}
	}

	return { sums, width, height, stride }
}

/**
 * Read the channel sum over the half-open rectangle `[x1, x2) × [y1, y2)`.
 * Coordinates are clamped to `[0, width] × [0, height]` (table coordinates,
 * i.e. one past the pixel grid on each axis). Channel index `c` selects R/G/B/A.
 */
export function integralChannelSum(
	integral: IntegralImage,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	channel: number,
): number {
	const { sums, width, height, stride } = integral
	const cx1 = x1 < 0 ? 0 : x1 > width ? width : x1
	const cy1 = y1 < 0 ? 0 : y1 > height ? height : y1
	const cx2 = x2 < 0 ? 0 : x2 > width ? width : x2
	const cy2 = y2 < 0 ? 0 : y2 > height ? height : y2

	const i00 = (cy1 * stride + cx1) * 4 + channel
	const i10 = (cy1 * stride + cx2) * 4 + channel
	const i01 = (cy2 * stride + cx1) * 4 + channel
	const i11 = (cy2 * stride + cx2) * 4 + channel

	return sums[i11]! - sums[i10]! - sums[i01]! + sums[i00]!
}
