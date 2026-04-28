import { describe, it, expect, beforeAll } from "vitest"
import { applyLIC } from "./LIC"

beforeAll(() => {
	globalThis.ImageData = class ImageData {
		readonly data: Uint8ClampedArray
		readonly width: number
		readonly height: number

		constructor(data: Uint8ClampedArray, width: number, height: number) {
			this.data = data
			this.width = width
			this.height = height
		}
	} as unknown as typeof globalThis.ImageData
})

function makeImage(width: number, height: number, fill: (x: number, y: number) => [number, number, number, number]): ImageData {
	const data = new Uint8ClampedArray(width * height * 4)
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const [r, g, b, a] = fill(x, y)
			const idx = (y * width + x) * 4
			data[idx] = r
			data[idx + 1] = g
			data[idx + 2] = b
			data[idx + 3] = a
		}
	}
	return new ImageData(data, width, height)
}

function uniformField(width: number, height: number, r: number, g: number, b: number): ImageData {
	return makeImage(width, height, () => [r, g, b, 255])
}

function verticalStripes(width: number, height: number): ImageData {
	// Alternating black/white columns
	return makeImage(width, height, (x) => {
		const v = x % 2 === 0 ? 0 : 255
		return [v, v, v, 255]
	})
}

function readChannel(image: ImageData, channel: 0 | 1 | 2 | 3): number[][] {
	const rows: number[][] = []
	for (let y = 0; y < image.height; y++) {
		const row: number[] = []
		for (let x = 0; x < image.width; x++) {
			row.push(image.data[(y * image.width + x) * 4 + channel] ?? 0)
		}
		rows.push(row)
	}
	return rows
}

function stddev(values: number[]): number {
	if (values.length === 0) return 0
	const mean = values.reduce((s, v) => s + v, 0) / values.length
	const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
	return Math.sqrt(variance)
}

describe("applyLIC", () => {
	it("smears vertical stripes into row-uniform output under a uniform horizontal field", () => {
		// Horizontal field: cos=1, sin=0, magnitude=1 → R=255, G=128 (≈127.5), B=255
		const seed = verticalStripes(32, 16)
		const field = uniformField(32, 16, 255, 128, 255)
		const result = applyLIC(seed, field, 20, 1.0)

		const channel = readChannel(result, 0)

		// Streamlines run horizontally and average ~20 stripes — the full row
		// should converge near the global mean (127.5). Per-row variation
		// drops sharply vs. the input (originally alternating 0/255, stddev≈127.5).
		const rowStddevs: number[] = channel.map((row) => stddev(row))
		const avgRow = rowStddevs.reduce((s, v) => s + v, 0) / rowStddevs.length

		expect(avgRow).toBeLessThan(50)

		// And output values cluster near 127 (mid-gray) — the average of an
		// equal mix of black and white stripes.
		for (const row of channel) {
			const mean = row.reduce((s, v) => s + v, 0) / row.length
			expect(Math.abs(mean - 127)).toBeLessThan(20)
		}
	})

	it("preserves vertical stripes under a uniform vertical field", () => {
		// Vertical field: cos=0, sin=1, magnitude=1 → R=128, G=255, B=255
		const seed = verticalStripes(32, 16)
		const field = uniformField(32, 16, 128, 255, 255)
		const result = applyLIC(seed, field, 20, 1.0)

		const channel = readChannel(result, 0)

		// Each column samples only itself (integration runs along the stripe),
		// so the alternating 0/255 pattern is preserved — per-row stddev stays
		// high, near the input's ~127.
		const rowStddevs: number[] = channel.map((row) => stddev(row))
		const avgRow = rowStddevs.reduce((s, v) => s + v, 0) / rowStddevs.length

		expect(avgRow).toBeGreaterThan(100)
	})

	it("integrates over a small neighborhood with a zero-magnitude field", () => {
		// Magnitude=0 (B=0), direction R=255 (cos=1) G=128 (sin≈0) — step is
		// floored at 0.25 rather than 0, so integration walks a small
		// neighborhood instead of stagnating.
		const seed = verticalStripes(32, 16)
		const field = uniformField(32, 16, 255, 128, 0)
		const result = applyLIC(seed, field, 20, 1.0)

		const channel = readChannel(result, 0)
		const rowStddevs: number[] = channel.map((row) => stddev(row))
		const avgRow = rowStddevs.reduce((s, v) => s + v, 0) / rowStddevs.length

		// Some smearing happens (avgRow drops below the unmixed input's ~127),
		// but it's a smaller neighborhood than the full-magnitude case (which
		// converges near 0) — output still shows residual stripe structure.
		expect(avgRow).toBeLessThan(127)
		expect(avgRow).toBeGreaterThan(20)
	})

	it("throws when seed and field dimensions do not match", () => {
		const seed = verticalStripes(32, 32)
		const field = uniformField(16, 16, 255, 128, 255)

		expect(() => applyLIC(seed, field, 10, 1.0)).toThrow()
	})

	it("preserves seed alpha", () => {
		// Seed has alpha=128 everywhere; output should preserve it.
		const seed = makeImage(8, 8, () => [200, 100, 50, 128])
		const field = uniformField(8, 8, 255, 128, 255)
		const result = applyLIC(seed, field, 10, 1.0)

		for (let i = 3; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(128)
		}
	})
})
