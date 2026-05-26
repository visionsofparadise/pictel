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

/**
 * Multi-channel separable box blur. Processes N channels through one shared
 * horizontal-pass scratch buffer (re-used across channels) and writes each
 * channel's vertical-pass result into the caller-supplied `into[c]` buffer
 * (or an allocated one if `into` is omitted).
 *
 * Allocation pattern: ONE Float32Array scratch (size `width*height`) + N
 * output Float32Arrays. When `into` is supplied (e.g. ShockFilter passing a
 * pre-allocated `smoothed` array across its iteration loop) the only
 * per-call allocation is the scratch — outputs are reused.
 *
 * Architecture decision (Phase 14.2): the horizontal-scratch CAN be shared
 * across channels because each channel completes its full horizontal pass →
 * vertical pass cycle before the next channel begins its horizontal pass.
 * The scratch is fully written by the horizontal pass and fully consumed by
 * the vertical pass within a single channel's iteration. Sharing the
 * horizontal scratch ACROSS the per-channel boundary would only be unsafe if
 * we did "all horizontals first, then all verticals" — which we don't.
 *
 * For `radius <= 0` the helper passthrough-copies each input channel into
 * its output (matches `boxBlurChannel`'s slice() semantics).
 */
export function boxBlurChannels(
	channels: ReadonlyArray<Float32Array>,
	width: number,
	height: number,
	radius: number,
	into?: Array<Float32Array>,
): Array<Float32Array> {
	const count = width * height
	const channelCount = channels.length
	const outputs: Array<Float32Array> =
		into ?? Array.from({ length: channelCount }, () => new Float32Array(count))

	const rounded = Math.round(radius)

	if (rounded <= 0) {
		for (let ch = 0; ch < channelCount; ch++) {
			outputs[ch]!.set(channels[ch]!)
		}

		return outputs
	}

	const window = rounded * 2 + 1
	// Shared horizontal scratch: one allocation amortized across all N
	// channels. Each channel rewrites the full scratch in its horizontal pass
	// and the vertical pass reads it fully before the next channel begins.
	const horizontal = new Float32Array(count)

	for (let ch = 0; ch < channelCount; ch++) {
		const src = channels[ch]!
		const output = outputs[ch]!

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
	}

	return outputs
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */
