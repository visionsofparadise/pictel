import { describe, it, expect, beforeAll } from "vitest"
import { applyShockFilter, applyMappedShockFilter } from "./ShockFilter"

beforeAll(() => {
	// Polyfill supports BOTH constructor forms — mixBlend (used internally by the mapped variant) calls the 2-arg form.
	globalThis.ImageData = class ImageData {
		readonly data: Uint8ClampedArray
		readonly width: number
		readonly height: number

		constructor(
			dataOrWidth: Uint8ClampedArray | number,
			widthOrHeight: number,
			height?: number,
		) {
			if (typeof dataOrWidth === "number") {
				this.width = dataOrWidth
				this.height = widthOrHeight
				this.data = new Uint8ClampedArray(dataOrWidth * widthOrHeight * 4)
			} else {
				this.data = dataOrWidth
				this.width = widthOrHeight
				this.height = height!
			}
		}
	} as unknown as typeof globalThis.ImageData
})

function uniform(size: number, r: number, g: number, b: number, a: number): ImageData {
	const data = new Uint8ClampedArray(size * size * 4)
	for (let i = 0; i < size * size; i++) {
		data[i * 4] = r
		data[i * 4 + 1] = g
		data[i * 4 + 2] = b
		data[i * 4 + 3] = a
	}
	return new ImageData(data, size, size)
}

// Smoothstep ramp, not linear — a linear ramp has zero curvature and produces no shock response.
function ramp(size: number): ImageData {
	const data = new Uint8ClampedArray(size * size * 4)
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4
			const t = x / (size - 1)
			const v = Math.round((3 * t * t - 2 * t * t * t) * 255)
			data[i] = v
			data[i + 1] = v
			data[i + 2] = v
			data[i + 3] = 255
		}
	}
	return new ImageData(data, size, size)
}

// Per-channel ramps may run opposite directions — this is where independent per-channel shock direction would fringe and luminance-coupled direction stays coherent.
function colorRamp(
	size: number,
	from: [number, number, number],
	to: [number, number, number],
): ImageData {
	const data = new Uint8ClampedArray(size * size * 4)
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4
			const t = x / (size - 1)
			const s = 3 * t * t - 2 * t * t * t
			for (let c = 0; c < 3; c++) {
				data[i + c] = Math.round(from[c]! + (to[c]! - from[c]!) * s)
			}
			data[i + 3] = 255
		}
	}
	return new ImageData(data, size, size)
}

describe("applyShockFilter", () => {
	it("uniform image is unchanged", () => {
		const input = uniform(5, 120, 80, 200, 255)
		const result = applyShockFilter(input, 8, 1)
		for (let i = 0; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(120)
			expect(result.data[i + 1]).toBe(80)
			expect(result.data[i + 2]).toBe(200)
		}
	})

	it("iterations=0 returns a pixel-equal copy", () => {
		const input = ramp(6)
		const result = applyShockFilter(input, 0, 1)
		expect(Array.from(result.data)).toEqual(Array.from(input.data))
		expect(result.data).not.toBe(input.data)
	})

	it("negative iterations returns a pixel-equal copy", () => {
		const input = ramp(6)
		const result = applyShockFilter(input, -3, 1)
		expect(Array.from(result.data)).toEqual(Array.from(input.data))
	})

	it("preserves alpha", () => {
		const input = uniform(5, 100, 150, 200, 42)
		const result = applyShockFilter(input, 6, 1)
		for (let i = 3; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(42)
		}
	})

	it("does not mutate input", () => {
		const input = ramp(6)
		const original = new Uint8ClampedArray(input.data)
		applyShockFilter(input, 8, 1)
		expect(Array.from(input.data)).toEqual(Array.from(original))
	})

	it("steepens a smooth ramp — mid-ramp pixels move toward the extremes", () => {
		const size = 9
		const input = ramp(size)
		const result = applyShockFilter(input, 12, 1)
		const row = 4 * size * 4

		const leftX = 2
		const leftBefore = input.data[row + leftX * 4]!
		const leftAfter = result.data[row + leftX * 4]!
		expect(leftAfter).toBeLessThan(leftBefore)

		const rightX = size - 3
		const rightBefore = input.data[row + rightX * 4]!
		const rightAfter = result.data[row + rightX * 4]!
		expect(rightAfter).toBeGreaterThan(rightBefore)
	})

	it("shocks every channel of a colour edge coherently — no per-channel fringing", () => {
		// Asserts on a SINGLE iteration: per-channel change shares sign within one pass; across many iterations the shared sign may flip between passes.
		const size = 9
		const from: [number, number, number] = [40, 200, 60]
		const to: [number, number, number] = [210, 40, 190]
		const input = colorRamp(size, from, to)
		const result = applyShockFilter(input, 1, 1)
		const row = 4 * size * 4

		let sampledAny = false

		for (let x = 1; x < size - 1; x++) {
			const base = row + x * 4
			const deltas = [0, 1, 2].map(
				(c) => result.data[base + c]! - input.data[base + c]!,
			)
			const moved = deltas.filter((d) => d !== 0)

			if (moved.length === 0) continue

			sampledAny = true
			const allPositive = moved.every((d) => d > 0)
			const allNegative = moved.every((d) => d < 0)
			expect(allPositive || allNegative).toBe(true)
		}

		expect(sampledAny).toBe(true)
	})
})

describe("applyMappedShockFilter", () => {
	it("all-white map equals the unmapped reference", () => {
		const input = ramp(7)
		const map = uniform(7, 255, 255, 255, 255)
		const result = applyMappedShockFilter(input, map, 8, 1)
		const reference = applyShockFilter(input, 8, 1)
		expect(Array.from(result.data)).toEqual(Array.from(reference.data))
	})

	it("all-black map returns the original (identity)", () => {
		const input = ramp(7)
		const map = uniform(7, 0, 0, 0, 255)
		const result = applyMappedShockFilter(input, map, 8, 1)
		for (let i = 0; i < result.data.length; i++) {
			expect(result.data[i]).toBe(input.data[i])
		}
	})

	it("preserves alpha", () => {
		const input = uniform(5, 100, 150, 200, 42)
		const map = uniform(5, 128, 128, 128, 255)
		const result = applyMappedShockFilter(input, map, 6, 1)
		for (let i = 3; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(42)
		}
	})

	it("does not mutate input", () => {
		const input = ramp(6)
		const map = uniform(6, 200, 200, 200, 255)
		const original = new Uint8ClampedArray(input.data)
		applyMappedShockFilter(input, map, 8, 1)
		expect(Array.from(input.data)).toEqual(Array.from(original))
	})
})
