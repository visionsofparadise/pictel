/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * Separable, edge-clamped box blur over a single-channel `Float32Array`.
 *
 * Runs a horizontal pass then a vertical pass, each a sliding-window box sum
 * normalized by the window width. Sample coordinates outside the image are
 * clamped to the nearest edge pixel (`[0, width-1]` / `[0, height-1]`).
 *
 * `radius` is rounded; a `radius <= 0` returns an unmodified copy of `src`.
 * The input array is never mutated — a new `Float32Array` is returned.
 */
export function boxBlurChannel(
	src: Float32Array,
	width: number,
	height: number,
	radius: number,
): Float32Array {
	const rounded = Math.round(radius)

	if (rounded <= 0) {
		return src.slice()
	}

	const window = rounded * 2 + 1
	const horizontal = new Float32Array(width * height)

	// Horizontal pass: for each row, slide a window of width `window`.
	for (let y = 0; y < height; y++) {
		const row = y * width

		for (let x = 0; x < width; x++) {
			let sum = 0

			for (let offset = -rounded; offset <= rounded; offset++) {
				let sx = x + offset

				if (sx < 0) sx = 0
				else if (sx > width - 1) sx = width - 1

				sum += src[row + sx]!
			}

			horizontal[row + x] = sum / window
		}
	}

	const output = new Float32Array(width * height)

	// Vertical pass over the horizontally blurred buffer.
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			let sum = 0

			for (let offset = -rounded; offset <= rounded; offset++) {
				let sy = y + offset

				if (sy < 0) sy = 0
				else if (sy > height - 1) sy = height - 1

				sum += horizontal[sy * width + x]!
			}

			output[y * width + x] = sum / window
		}
	}

	return output
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */
