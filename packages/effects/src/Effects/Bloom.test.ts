import { describe, it, expect, beforeAll } from "vitest"
import { applyBloom, applyMappedBloom } from "./Bloom"

beforeAll(() => {
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
				// 2-arg form: new ImageData(width, height)
				this.width = dataOrWidth
				this.height = widthOrHeight
				this.data = new Uint8ClampedArray(dataOrWidth * widthOrHeight * 4)
			} else {
				// 3-arg form: new ImageData(data, width, height)
				this.data = dataOrWidth
				this.width = widthOrHeight
				this.height = height!
			}
		}
	} as unknown as typeof globalThis.ImageData
})

function uniform(size: number, red: number, green: number, blue: number, alpha: number): ImageData {
	const data = new Uint8ClampedArray(size * size * 4)
	for (let i = 0; i < size * size; i++) {
		data[i * 4] = red
		data[i * 4 + 1] = green
		data[i * 4 + 2] = blue
		data[i * 4 + 3] = alpha
	}
	return new ImageData(data, size, size)
}

describe("applyBloom", () => {
	it("an image entirely below threshold is unchanged", () => {
		// Mid-gray (128) luminance is 128/255 ≈ 0.5, well below threshold 0.75.
		const input = uniform(8, 128, 128, 128, 255)
		const result = applyBloom(input, 0.75, 4, 1)
		expect(Array.from(result.data)).toEqual(Array.from(input.data))
	})

	it("intensity=0 returns an unchanged image", () => {
		// Bright pixels would bloom, but intensity 0 → no glow contribution.
		const input = uniform(8, 240, 240, 240, 255)
		const result = applyBloom(input, 0.5, 6, 0)
		expect(Array.from(result.data)).toEqual(Array.from(input.data))
	})

	it("a bright pixel on a dark field brightens its neighbors", () => {
		const size = 9
		const data = new Uint8ClampedArray(size * size * 4)
		for (let i = 0; i < size * size; i++) {
			data[i * 4 + 3] = 255
		}
		// Single bright pixel at the center.
		const center = (4 * size + 4) * 4
		data[center] = 255
		data[center + 1] = 255
		data[center + 2] = 255
		const input = new ImageData(data, size, size)

		const result = applyBloom(input, 0.5, 4, 2)

		// An adjacent pixel started fully black; the glow should lift it.
		const neighbor = (4 * size + 5) * 4
		expect(result.data[neighbor]!).toBeGreaterThan(0)
	})

	it("a compact highlight produces a measurably visible glow at a matched radius", () => {
		// Regression for the Glow demo "no visible difference" bug. The effect
		// itself is correct, but with a radius far larger than the highlight
		// regions the box blur averages the bright pixels down toward black, so
		// the screen-blend lift collapses to a sub-perceptible sliver. A glow at a
		// radius matched to the highlight size must measurably brighten the field
		// around it. With the demo's old radius (28) on this 8x8 highlight the
		// lift below would be ~5/255; at a matched radius it is ~48/255.
		const size = 64
		const data = new Uint8ClampedArray(size * size * 4)
		for (let i = 0; i < size * size; i++) {
			data[i * 4 + 3] = 255
		}
		// A compact 8x8 bright block in the centre on an otherwise black field.
		for (let y = 28; y < 36; y++) {
			for (let x = 28; x < 36; x++) {
				const i = (y * size + x) * 4
				data[i] = 220
				data[i + 1] = 220
				data[i + 2] = 220
			}
		}
		const input = new ImageData(data, size, size)
		const result = applyBloom(input, 0.2, 8, 3)

		// A pixel just outside the bright block started fully black. The glow
		// must lift it by a clearly visible amount, not a rounding sliver.
		const justOutside = (31 * size + 38) * 4
		expect(input.data[justOutside]).toBe(0)
		expect(result.data[justOutside]!).toBeGreaterThan(24)

		// The brightening must be broad, not a single-pixel fringe.
		let lifted = 0
		for (let i = 0; i < input.data.length; i += 4) {
			if (result.data[i]! - input.data[i]! >= 4) lifted++
		}
		expect(lifted).toBeGreaterThan(size * size * 0.1)
	})

	it("output dimensions equal input dimensions", () => {
		const input = uniform(10, 200, 200, 200, 255)
		const result = applyBloom(input, 0.5, 8, 1)
		expect(result.width).toBe(10)
		expect(result.height).toBe(10)
	})

	it("preserves alpha", () => {
		const input = uniform(6, 240, 240, 240, 42)
		const result = applyBloom(input, 0.5, 4, 1)
		for (let i = 3; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(42)
		}
	})

	it("does not mutate input", () => {
		const input = uniform(6, 240, 240, 240, 255)
		const original = new Uint8ClampedArray(input.data)
		applyBloom(input, 0.5, 4, 1)
		expect(input.data).toEqual(original)
	})
})

describe("applyMappedBloom", () => {
	it("an all-white map equals the unmapped applyBloom reference", () => {
		const input = uniform(8, 240, 240, 240, 255)
		const map = uniform(8, 255, 255, 255, 255)
		const result = applyMappedBloom(input, map, 0.5, 6, 1.5)
		const reference = applyBloom(input, 0.5, 6, 1.5)
		expect(Array.from(result.data)).toEqual(Array.from(reference.data))
	})

	it("an all-black map returns the original (identity)", () => {
		const input = uniform(8, 240, 240, 240, 255)
		const map = uniform(8, 0, 0, 0, 255)
		const result = applyMappedBloom(input, map, 0.5, 6, 1.5)
		expect(Array.from(result.data)).toEqual(Array.from(input.data))
	})

	it("preserves alpha", () => {
		const input = uniform(6, 240, 240, 240, 42)
		const map = uniform(6, 128, 128, 128, 255)
		const result = applyMappedBloom(input, map, 0.5, 4, 1)
		for (let i = 3; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(42)
		}
	})

	it("does not mutate input", () => {
		const input = uniform(6, 240, 240, 240, 255)
		const original = new Uint8ClampedArray(input.data)
		applyMappedBloom(input, uniform(6, 200, 200, 200, 255), 0.5, 4, 1)
		expect(input.data).toEqual(original)
	})
})
