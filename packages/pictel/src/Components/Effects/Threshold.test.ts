import { describe, it, expect, beforeAll } from "vitest"
import { applyThreshold, applyMappedThreshold } from "./Threshold"

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

function pixel(r: number, g: number, b: number, a: number): ImageData {
	return new ImageData(new Uint8ClampedArray([r, g, b, a]), 1, 1)
}

describe("applyThreshold", () => {
	it("white pixel with threshold=128 stays white", () => {
		const result = applyThreshold(pixel(255, 255, 255, 255), 128)
		expect(result.data[0]).toBe(255)
		expect(result.data[1]).toBe(255)
		expect(result.data[2]).toBe(255)
	})

	it("black pixel with threshold=128 stays black", () => {
		const result = applyThreshold(pixel(0, 0, 0, 255), 128)
		expect(result.data[0]).toBe(0)
		expect(result.data[1]).toBe(0)
		expect(result.data[2]).toBe(0)
	})

	it("mid-gray 129 with threshold=128 becomes white (>=)", () => {
		// BT.601 luminance of (129,129,129) ≈ 129, which is >= 128
		const result = applyThreshold(pixel(129, 129, 129, 255), 128)
		expect(result.data[0]).toBe(255)
	})

	it("mid-gray 127 with threshold=128 becomes black", () => {
		// BT.601 luminance of (127,127,127) ≈ 127
		const result = applyThreshold(pixel(127, 127, 127, 255), 128)
		expect(result.data[0]).toBe(0)
	})

	it("threshold=0 makes everything white", () => {
		const result = applyThreshold(pixel(0, 0, 0, 255), 0)
		expect(result.data[0]).toBe(255)
	})

	it("threshold=256 makes everything black", () => {
		const result = applyThreshold(pixel(255, 255, 255, 255), 256)
		expect(result.data[0]).toBe(0)
	})

	it("preserves alpha unchanged", () => {
		const result = applyThreshold(pixel(200, 200, 200, 42), 128)
		expect(result.data[3]).toBe(42)
	})
})

describe("applyMappedThreshold", () => {
	it("all-black map produces threshold=0 (everything white)", () => {
		const input = pixel(10, 10, 10, 255)
		const map = pixel(0, 0, 0, 255)
		const result = applyMappedThreshold(input, map, 128)
		// Black map → luminance 0 → perPixelThreshold = 0 * 128 = 0
		// Source luminance ≈ 10, which is >= 0 → white
		expect(result.data[0]).toBe(255)
		expect(result.data[1]).toBe(255)
		expect(result.data[2]).toBe(255)
	})

	it("all-white map produces full threshold", () => {
		const input = pixel(100, 100, 100, 255)
		const map = pixel(255, 255, 255, 255)
		const result = applyMappedThreshold(input, map, 128)
		// White map → luminance 1 → perPixelThreshold = 1 * 128 = 128
		// Source luminance = 100, which is < 128 → black
		expect(result.data[0]).toBe(0)
		expect(result.data[1]).toBe(0)
		expect(result.data[2]).toBe(0)
	})

	it("gradient map produces varying thresholds", () => {
		// 2-pixel image: both mid-gray source
		const input = new ImageData(new Uint8ClampedArray([100, 100, 100, 255, 100, 100, 100, 255]), 2, 1)
		const map = new ImageData(new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255]), 2, 1)
		const result = applyMappedThreshold(input, map, 200)
		// Black map pixel → threshold = 0 → source lum 100 >= 0 → white
		// White map pixel → threshold = 200 → source lum 100 < 200 → black
		expect(result.data[0]).toBe(255)
		expect(result.data[4]).toBe(0)
	})

	it("preserves alpha unchanged", () => {
		const input = pixel(200, 200, 200, 42)
		const map = pixel(128, 128, 128, 255)
		const result = applyMappedThreshold(input, map, 128)
		expect(result.data[3]).toBe(42)
	})
})
