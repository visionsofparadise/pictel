import { describe, it, expect, beforeAll } from "vitest"
import { applyDropShadow } from "./DropShadow"

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

function solidPixel(r: number, g: number, b: number, a: number): ImageData {
	return new ImageData(new Uint8ClampedArray([r, g, b, a]), 1, 1)
}

describe("applyDropShadow", () => {
	it("output dimensions include overflow from blur and offset", () => {
		const result = applyDropShadow(solidPixel(255, 0, 0, 255), 5, 5, 3, "#000000")
		// Without blur: outW = 1 + 2*3 + 5 = 12, outH = 1 + 2*3 + 5 = 12
		// With blur applied by applyUniformBlur: adds 2*3 more = 18 x 18
		expect(result.pixels.width).toBeGreaterThan(1)
		expect(result.pixels.height).toBeGreaterThan(1)
	})

	it("returns overflow bounds", () => {
		const result = applyDropShadow(solidPixel(255, 0, 0, 255), 0, 0, 3, "#000000")
		expect(result.overflow).toBeDefined()
		expect(result.overflow!.top).toBeGreaterThan(0)
		expect(result.overflow!.right).toBeGreaterThan(0)
		expect(result.overflow!.bottom).toBeGreaterThan(0)
		expect(result.overflow!.left).toBeGreaterThan(0)
	})

	it("shadow color is applied", () => {
		const result = applyDropShadow(solidPixel(255, 255, 255, 255), 2, 2, 0, "#ff0000")
		// The shadow should be red — check a pixel at the shadow offset area
		const { width, data } = result.pixels
		// Shadow is at offset (2, 2) from source position; source is at (max(0,-offsetX), max(0,-offsetY)) = (0, 0)
		// Shadow pixel at (2, 2) before source composite
		const shadowX = 2
		const shadowY = 2
		const idx = (shadowY * width + shadowX) * 4
		expect(data[idx]).toBe(255) // red
		expect(data[idx + 1]).toBe(0) // green
		expect(data[idx + 2]).toBe(0) // blue
	})

	it("source pixels are composited over shadow", () => {
		const result = applyDropShadow(solidPixel(0, 255, 0, 255), 2, 2, 0, "#ff0000")
		// Source is at (0, 0) in the output
		const idx = 0
		expect(result.pixels.data[idx]).toBe(0)
		expect(result.pixels.data[idx + 1]).toBe(255)
		expect(result.pixels.data[idx + 2]).toBe(0)
		expect(result.pixels.data[idx + 3]).toBe(255)
	})

	it("does not mutate input", () => {
		const input = solidPixel(255, 0, 0, 255)
		const originalData = new Uint8ClampedArray(input.data)
		applyDropShadow(input, 5, 5, 3, "#000000")
		expect(input.data).toEqual(originalData)
	})

	it("zero blur radius produces unblurred shadow", () => {
		const result = applyDropShadow(solidPixel(255, 0, 0, 255), 3, 3, 0, "#000000")
		// Without blur: outW = 1 + 0 + 3 = 4, outH = 1 + 0 + 3 = 4
		expect(result.pixels.width).toBe(4)
		expect(result.pixels.height).toBe(4)
	})
})
