import { describe, it, expect, beforeAll } from "vitest"
import { applyBrightness, applyMappedBrightness } from "./Brightness"

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

describe("applyBrightness", () => {
	it("amount 1 is identity", () => {
		const result = applyBrightness(pixel(100, 150, 200, 255), 1)
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(150)
		expect(result.data[2]).toBe(200)
	})

	it("amount 2 doubles channel values", () => {
		const result = applyBrightness(pixel(50, 100, 120, 255), 2)
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(200)
		expect(result.data[2]).toBe(240)
	})

	it("amount 0 produces black", () => {
		const result = applyBrightness(pixel(100, 150, 200, 255), 0)
		expect(result.data[0]).toBe(0)
		expect(result.data[1]).toBe(0)
		expect(result.data[2]).toBe(0)
	})

	it("clamps to 255", () => {
		const result = applyBrightness(pixel(200, 200, 200, 255), 2)
		expect(result.data[0]).toBe(255)
		expect(result.data[1]).toBe(255)
		expect(result.data[2]).toBe(255)
	})

	it("preserves alpha", () => {
		const result = applyBrightness(pixel(100, 150, 200, 42), 2)
		expect(result.data[3]).toBe(42)
	})

	it("does not mutate input", () => {
		const input = pixel(100, 150, 200, 255)
		const originalData = new Uint8ClampedArray(input.data)
		applyBrightness(input, 2)
		expect(input.data).toEqual(originalData)
	})
})

describe("applyMappedBrightness", () => {
	it("all-black map is identity", () => {
		const input = pixel(100, 150, 200, 255)
		const map = pixel(0, 0, 0, 255)
		const result = applyMappedBrightness(input, map, 2)
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(150)
		expect(result.data[2]).toBe(200)
	})

	it("all-white map applies full effect", () => {
		const input = pixel(50, 100, 120, 255)
		const map = pixel(255, 255, 255, 255)
		const result = applyMappedBrightness(input, map, 2)
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(200)
		expect(result.data[2]).toBe(240)
	})
})
