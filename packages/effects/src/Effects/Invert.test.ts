import { describe, it, expect, beforeAll } from "vitest"
import { applyInvert } from "./Invert"

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

describe("applyInvert", () => {
	it("amount 1 fully inverts", () => {
		const result = applyInvert(pixel(100, 150, 200, 255), 1)
		expect(result.data[0]).toBe(155)
		expect(result.data[1]).toBe(105)
		expect(result.data[2]).toBe(55)
	})

	it("amount 0 is identity", () => {
		const result = applyInvert(pixel(100, 150, 200, 255), 0)
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(150)
		expect(result.data[2]).toBe(200)
	})

	it("double invert is identity", () => {
		const input = pixel(100, 150, 200, 255)
		const inverted = applyInvert(input, 1)
		const result = applyInvert(inverted, 1)
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(150)
		expect(result.data[2]).toBe(200)
	})

	it("preserves alpha", () => {
		const result = applyInvert(pixel(100, 150, 200, 42), 1)
		expect(result.data[3]).toBe(42)
	})

	it("does not mutate input", () => {
		const input = pixel(100, 150, 200, 255)
		const originalData = new Uint8ClampedArray(input.data)
		applyInvert(input, 1)
		expect(input.data).toEqual(originalData)
	})
})
