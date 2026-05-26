 

/**
 * mulberry32 — small fast deterministic PRNG. Same seed always yields the
 * same sequence; benchmarks across runs see identical pixel data.
 */
function mulberry32(seed: number): () => number {
	let state = seed >>> 0

	return () => {
		state = (state + 0x6d2b79f5) >>> 0
		let x = state
		x = Math.imul(x ^ (x >>> 15), x | 1)
		x ^= x + Math.imul(x ^ (x >>> 7), x | 61)

		return ((x ^ (x >>> 14)) >>> 0) / 4294967296
	}
}

/**
 * Build a deterministic test ImageData. The pixels are seeded noise modulated
 * by a smooth gradient so effects that key on luminance, edges, and gradients
 * have realistic structure to chew on.
 */
export function makeTestImage(width = 1024, height = 1024, seed = 0xc0ffee): ImageData {
	const data = new Uint8ClampedArray(width * height * 4)
	const rng = mulberry32(seed)

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const px = (y * width + x) * 4
			const gradient = (x + y) / (width + height)
			const noise = rng()
			data[px] = (0.4 + 0.6 * gradient) * 255 * (0.6 + 0.4 * noise) | 0
			data[px + 1] = (0.3 + 0.7 * (1 - gradient)) * 255 * (0.6 + 0.4 * noise) | 0
			data[px + 2] = (0.5 + 0.5 * Math.sin(x * 0.01) * Math.cos(y * 0.01)) * 255 | 0
			data[px + 3] = 255
		}
	}

	return new ImageData(data, width, height)
}

/**
 * Synthesizes a Direction-packed field (R = cos, G = sin, B = magnitude) of
 * a swirling vector field. Used as the LIC `field` input.
 */
export function makeSwirlField(width = 1024, height = 1024): ImageData {
	const data = new Uint8ClampedArray(width * height * 4)
	const cx = width * 0.5
	const cy = height * 0.5

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const px = (y * width + x) * 4
			const dx = x - cx
			const dy = y - cy
			const distance = Math.sqrt(dx * dx + dy * dy)
			const angle = Math.atan2(dy, dx) + Math.PI / 2
			const cos = Math.cos(angle)
			const sin = Math.sin(angle)
			const magnitude = Math.min(1, distance / (Math.min(width, height) * 0.4))
			data[px] = ((cos + 1) * 127.5) | 0
			data[px + 1] = ((sin + 1) * 127.5) | 0
			data[px + 2] = (magnitude * 255) | 0
			data[px + 3] = 255
		}
	}

	return new ImageData(data, width, height)
}
