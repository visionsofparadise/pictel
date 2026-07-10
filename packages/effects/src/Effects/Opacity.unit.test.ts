import { describe, it, expect, beforeAll } from "vitest"
import { applyOpacity, applyMappedOpacity } from "./Opacity"

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

describe("applyOpacity", () => {
	it("amount 1 is identity", () => {
		const result = applyOpacity(pixel(100, 150, 200, 255), 1)
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(150)
		expect(result.data[2]).toBe(200)
		expect(result.data[3]).toBe(255)
	})

	it("amount 0 produces fully transparent", () => {
		const result = applyOpacity(pixel(100, 150, 200, 255), 0)
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(150)
		expect(result.data[2]).toBe(200)
		expect(result.data[3]).toBe(0)
	})

	it("amount 0.5 halves alpha", () => {
		const result = applyOpacity(pixel(100, 150, 200, 200), 0.5)
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(150)
		expect(result.data[2]).toBe(200)
		expect(result.data[3]).toBe(100)
	})

	it("preserves RGB unchanged", () => {
		const result = applyOpacity(pixel(100, 150, 200, 255), 0.5)
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(150)
		expect(result.data[2]).toBe(200)
	})

	it("does not mutate input", () => {
		const input = pixel(100, 150, 200, 255)
		const originalData = new Uint8ClampedArray(input.data)
		applyOpacity(input, 0.5)
		expect(input.data).toEqual(originalData)
	})
})

describe("applyMappedOpacity", () => {
	it("all-black map is identity", () => {
		const input = pixel(100, 150, 200, 255)
		const map = pixel(0, 0, 0, 255)
		const result = applyMappedOpacity(input, map, 0)
		expect(result.data[3]).toBe(255)
	})

	it("all-white map applies full effect", () => {
		const input = pixel(100, 150, 200, 255)
		const map = pixel(255, 255, 255, 255)
		const result = applyMappedOpacity(input, map, 0)
		expect(result.data[3]).toBe(0)
	})
})
