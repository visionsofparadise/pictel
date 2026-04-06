import { describe, it, expect, beforeAll } from "vitest"
import { applyThreshold } from "./Threshold"

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
