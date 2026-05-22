import { describe, it, expect, beforeAll } from "vitest"
import { applyShockFilter, applyMappedShockFilter } from "./ShockFilter"

beforeAll(() => {
	// Polyfill supporting both the 3-arg form (new ImageData(data, w, h)) used by
	// the test fixtures and the 2-arg form (new ImageData(w, h)) used internally
	// by mixBlend in the mapped variant.
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

// A horizontal blurry edge — a smoothstep transition from dark to bright across
// the width. Unlike a linear ramp (zero curvature, so no shock response), a
// smoothstep has the curvature a shock filter steepens. Constant down each
// column. Square `size` x `size`, grayscale.
function ramp(size: number): ImageData {
	const data = new Uint8ClampedArray(size * size * 4)
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4
			const t = x / (size - 1)
			// smoothstep: 3t^2 - 2t^3
			const v = Math.round((3 * t * t - 2 * t * t * t) * 255)
			data[i] = v
			data[i + 1] = v
			data[i + 2] = v
			data[i + 3] = 255
		}
	}
	return new ImageData(data, size, size)
}

// A horizontal blurry COLOR edge — a smoothstep transition across the width
// from one colour (`from`) to another (`to`). Constant down each column. The
// per-channel ramps differ (one channel may rise where another falls), which
// is exactly the case where deciding the shock direction per channel would let
// the channels disagree about which way to pull. With luminance coupling the
// direction is shared, so every channel shocks coherently.
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
		// And it is an independent copy, not the same buffer.
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
		// A linear ramp has its midpoint near 128. Shock filtering pushes each
		// side of the implicit edge away from the local mean: the darker half
		// gets darker, the brighter half gets brighter.
		const size = 9
		const input = ramp(size)
		const result = applyShockFilter(input, 12, 1)
		const row = 4 * size * 4 // a middle row

		// A pixel left of center (originally < 128) should be pushed darker.
		const leftX = 2
		const leftBefore = input.data[row + leftX * 4]!
		const leftAfter = result.data[row + leftX * 4]!
		expect(leftAfter).toBeLessThan(leftBefore)

		// A pixel right of center (originally > 128) should be pushed brighter.
		const rightX = size - 3
		const rightBefore = input.data[row + rightX * 4]!
		const rightAfter = result.data[row + rightX * 4]!
		expect(rightAfter).toBeGreaterThan(rightBefore)
	})

	it("shocks every channel of a colour edge coherently — no per-channel fringing", () => {
		// A blurry colour edge: green channel falls while red and blue rise
		// across the width. The shock direction is decided once from luminance,
		// so within an iteration all three channels must pull toward the SAME
		// side of the edge at a given pixel. A per-channel-independent filter
		// would let green pull one way while red/blue pull the other (their
		// gradients curve oppositely), producing colour fringing.
		//
		// A single iteration's per-channel change is `-sign(Lluminance) *
		// gradMag_channel * dt`; gradMag is non-negative, so every channel's
		// change at a pixel shares the sign `-sign(Lluminance)` (or is zero).
		// Asserting on one iteration keeps the coherence guarantee exact —
		// across many iterations the shared sign may flip between passes.
		const size = 9
		const from: [number, number, number] = [40, 200, 60]
		const to: [number, number, number] = [210, 40, 190]
		const input = colorRamp(size, from, to)
		const result = applyShockFilter(input, 1, 1)
		const row = 4 * size * 4 // a middle row

		let sampledAny = false

		for (let x = 1; x < size - 1; x++) {
			const base = row + x * 4
			const deltas = [0, 1, 2].map(
				(c) => result.data[base + c]! - input.data[base + c]!,
			)
			const moved = deltas.filter((d) => d !== 0)

			if (moved.length === 0) continue

			sampledAny = true
			// Every channel that moved at this pixel moved in the same
			// direction — the shock is colour-coherent, not fringing.
			const allPositive = moved.every((d) => d > 0)
			const allNegative = moved.every((d) => d < 0)
			expect(allPositive || allNegative).toBe(true)
		}

		// The edge actually produced shocks somewhere along the row.
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
