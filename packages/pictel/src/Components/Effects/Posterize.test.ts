import { describe, it, expect, beforeAll } from "vitest"
import { applyPosterize } from "./Posterize"

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

describe("applyPosterize", () => {
	it("levels=2 produces binary output (0 or 255)", () => {
		const result = applyPosterize(pixel(100, 200, 127, 255), 2)
		// 100/255 = 0.392 -> round(0.392*1)/1*255 = 0
		// 200/255 = 0.784 -> round(0.784*1)/1*255 = 255
		// 127/255 = 0.498 -> round(0.498*1)/1*255 = 0
		expect(result.data[0]).toBe(0)
		expect(result.data[1]).toBe(255)
		expect(result.data[2]).toBe(0)
	})

	it("levels=256 output equals input", () => {
		const result = applyPosterize(pixel(42, 128, 200, 255), 256)
		expect(result.data[0]).toBe(42)
		expect(result.data[1]).toBe(128)
		expect(result.data[2]).toBe(200)
	})

	it("levels=4 maps value 100 correctly", () => {
		// 100/255 = 0.392, * 3 = 1.176, round = 1, / 3 * 255 = 85
		const result = applyPosterize(pixel(100, 100, 100, 255), 4)
		expect(result.data[0]).toBe(85)
	})

	it("preserves alpha unchanged", () => {
		const result = applyPosterize(pixel(100, 100, 100, 77), 4)
		expect(result.data[3]).toBe(77)
	})
})
