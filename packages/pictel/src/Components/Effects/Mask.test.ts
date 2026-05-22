import { describe, it, expect, beforeAll } from "vitest"
import { applyMask } from "./Mask"

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

function pixel(red: number, green: number, blue: number, alpha: number): ImageData {
	return new ImageData(new Uint8ClampedArray([red, green, blue, alpha]), 1, 1)
}

describe("applyMask", () => {
	it("source='alpha': multiplies source alpha by the mask's alpha", () => {
		const result = applyMask(pixel(200, 100, 50, 200), pixel(0, 0, 0, 255), "alpha")

		expect(result.data[3]).toBe(200)
	})

	it("source='alpha': a fully transparent mask drops the pixel", () => {
		const result = applyMask(pixel(200, 100, 50, 255), pixel(255, 255, 255, 0), "alpha")

		expect(result.data[3]).toBe(0)
	})

	it("source='alpha': a half-alpha mask halves the source alpha", () => {
		const result = applyMask(pixel(200, 100, 50, 200), pixel(0, 0, 0, 128), "alpha")

		expect(result.data[3]).toBe(Math.round(200 * (128 / 255)))
	})

	it("source='luminance': a white mask keeps the pixel", () => {
		const result = applyMask(pixel(200, 100, 50, 240), pixel(255, 255, 255, 255), "luminance")

		expect(result.data[3]).toBe(240)
	})

	it("source='luminance': a black mask drops the pixel", () => {
		const result = applyMask(pixel(200, 100, 50, 240), pixel(0, 0, 0, 255), "luminance")

		expect(result.data[3]).toBe(0)
	})

	it("leaves RGB untouched", () => {
		const result = applyMask(pixel(200, 100, 50, 255), pixel(10, 20, 30, 128), "alpha")

		expect(result.data[0]).toBe(200)
		expect(result.data[1]).toBe(100)
		expect(result.data[2]).toBe(50)
	})

	it("throws when pixel and mask dimensions differ", () => {
		const pixels = new ImageData(new Uint8ClampedArray(4 * 4 * 4), 4, 4)
		const mask = new ImageData(new Uint8ClampedArray(2 * 2 * 4), 2, 2)

		expect(() => applyMask(pixels, mask, "alpha")).toThrow(/dimensions must match/)
	})
})
