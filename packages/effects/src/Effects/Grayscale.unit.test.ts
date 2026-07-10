import { describe, it, expect, beforeAll } from "vitest"
import { applyGrayscale } from "./Grayscale"

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

describe("applyGrayscale", () => {
	it("amount 1 produces BT.601 grayscale", () => {
		const result = applyGrayscale(pixel(255, 0, 0, 255), 1)
		const expectedLum = Math.round(0.299 * 255)
		expect(result.data[0]).toBeCloseTo(expectedLum, 0)
		expect(result.data[1]).toBeCloseTo(expectedLum, 0)
		expect(result.data[2]).toBeCloseTo(expectedLum, 0)
	})

	it("amount 0 is identity", () => {
		const result = applyGrayscale(pixel(100, 150, 200, 255), 0)
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(150)
		expect(result.data[2]).toBe(200)
	})

	it("gray input is unchanged at any amount", () => {
		const result = applyGrayscale(pixel(128, 128, 128, 255), 1)
		expect(result.data[0]).toBeCloseTo(128, 0)
		expect(result.data[1]).toBeCloseTo(128, 0)
		expect(result.data[2]).toBeCloseTo(128, 0)
	})

	it("preserves alpha", () => {
		const result = applyGrayscale(pixel(100, 150, 200, 42), 1)
		expect(result.data[3]).toBe(42)
	})

	it("does not mutate input", () => {
		const input = pixel(100, 150, 200, 255)
		const originalData = new Uint8ClampedArray(input.data)
		applyGrayscale(input, 1)
		expect(input.data).toEqual(originalData)
	})
})
