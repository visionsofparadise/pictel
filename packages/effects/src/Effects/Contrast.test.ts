import { describe, it, expect, beforeAll } from "vitest"
import { applyContrast, applyMappedContrast } from "./Contrast"

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

describe("applyContrast", () => {
	it("amount 1 is identity", () => {
		const result = applyContrast(pixel(100, 150, 200, 255), 1)
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(150)
		expect(result.data[2]).toBe(200)
	})

	it("amount 0 produces mid-gray", () => {
		const result = applyContrast(pixel(0, 100, 255, 255), 0)
		expect(result.data[0]).toBeCloseTo(128, 0)
		expect(result.data[1]).toBeCloseTo(128, 0)
		expect(result.data[2]).toBeCloseTo(128, 0)
	})

	it("amount 2 doubles contrast", () => {
		const result = applyContrast(pixel(200, 128, 50, 255), 2)
		expect(result.data[0]).toBe(255)
		expect(result.data[1]).toBeCloseTo(128, 0)
		expect(result.data[2]).toBe(0)
	})

	it("preserves alpha", () => {
		const result = applyContrast(pixel(100, 150, 200, 42), 2)
		expect(result.data[3]).toBe(42)
	})

	it("does not mutate input", () => {
		const input = pixel(100, 150, 200, 255)
		const originalData = new Uint8ClampedArray(input.data)
		applyContrast(input, 2)
		expect(input.data).toEqual(originalData)
	})
})

describe("applyMappedContrast", () => {
	it("all-black map is identity", () => {
		const input = pixel(100, 150, 200, 255)
		const map = pixel(0, 0, 0, 255)
		const result = applyMappedContrast(input, map, 2)
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(150)
		expect(result.data[2]).toBe(200)
	})

	it("all-white map applies full effect", () => {
		const input = pixel(200, 128, 50, 255)
		const map = pixel(255, 255, 255, 255)
		const result = applyMappedContrast(input, map, 0)
		expect(result.data[0]).toBeCloseTo(128, 0)
		expect(result.data[1]).toBeCloseTo(128, 0)
		expect(result.data[2]).toBeCloseTo(128, 0)
	})
})
