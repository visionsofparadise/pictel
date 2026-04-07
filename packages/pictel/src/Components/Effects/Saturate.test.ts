import { describe, it, expect, beforeAll } from "vitest"
import { applySaturate, applyMappedSaturate } from "./Saturate"

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

describe("applySaturate", () => {
	it("amount 1 is identity", () => {
		const result = applySaturate(pixel(100, 150, 200, 255), 1)
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(150)
		expect(result.data[2]).toBe(200)
	})

	it("amount 0 produces grayscale", () => {
		const result = applySaturate(pixel(255, 0, 0, 255), 0)
		const lum = Math.round(0.299 * 255)
		expect(result.data[0]).toBeCloseTo(lum, 0)
		expect(result.data[1]).toBeCloseTo(lum, 0)
		expect(result.data[2]).toBeCloseTo(lum, 0)
	})

	it("preserves alpha", () => {
		const result = applySaturate(pixel(100, 150, 200, 42), 1)
		expect(result.data[3]).toBe(42)
	})

	it("does not mutate input", () => {
		const input = pixel(100, 150, 200, 255)
		const originalData = new Uint8ClampedArray(input.data)
		applySaturate(input, 2)
		expect(input.data).toEqual(originalData)
	})
})

describe("applyMappedSaturate", () => {
	it("all-black map is identity", () => {
		const input = pixel(100, 150, 200, 255)
		const map = pixel(0, 0, 0, 255)
		const result = applyMappedSaturate(input, map, 0)
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(150)
		expect(result.data[2]).toBe(200)
	})

	it("all-white map applies full effect", () => {
		const input = pixel(255, 0, 0, 255)
		const map = pixel(255, 255, 255, 255)
		const result = applyMappedSaturate(input, map, 0)
		const lum = Math.round(0.299 * 255)
		expect(result.data[0]).toBeCloseTo(lum, 0)
		expect(result.data[1]).toBeCloseTo(lum, 0)
		expect(result.data[2]).toBeCloseTo(lum, 0)
	})
})
