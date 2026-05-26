/* eslint-disable @typescript-eslint/no-non-null-assertion */

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
