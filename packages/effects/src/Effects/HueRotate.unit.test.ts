import { describe, it, expect, beforeAll } from "vitest"
import { applyHueRotate, applyMappedHueRotate } from "./HueRotate"

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

describe("applyHueRotate", () => {
	it("0 degrees is identity", () => {
		const result = applyHueRotate(pixel(255, 0, 0, 255), 0)
		expect(result.data[0]).toBe(255)
		expect(result.data[1]).toBe(0)
		expect(result.data[2]).toBe(0)
	})

	it("360 degrees is identity", () => {
		const result = applyHueRotate(pixel(255, 0, 0, 255), 360)
		expect(result.data[0]).toBe(255)
		expect(result.data[1]).toBe(0)
		expect(result.data[2]).toBe(0)
	})

	it("180 degrees produces complementary color", () => {
		const result = applyHueRotate(pixel(255, 0, 0, 255), 180)
		expect(result.data[0]).toBe(0)
		expect(result.data[1]).toBe(255)
		expect(result.data[2]).toBe(255)
	})

	it("preserves alpha", () => {
		const result = applyHueRotate(pixel(255, 0, 0, 42), 90)
		expect(result.data[3]).toBe(42)
	})

	it("does not mutate input", () => {
		const input = pixel(255, 0, 0, 255)
		const originalData = new Uint8ClampedArray(input.data)
		applyHueRotate(input, 90)
		expect(input.data).toEqual(originalData)
	})

	it("gray is unchanged at any angle", () => {
		const result = applyHueRotate(pixel(128, 128, 128, 255), 90)
		expect(result.data[0]).toBe(128)
		expect(result.data[1]).toBe(128)
		expect(result.data[2]).toBe(128)
	})
})

describe("applyMappedHueRotate", () => {
	it("all-black map is identity", () => {
		const input = pixel(255, 0, 0, 255)
		const map = pixel(0, 0, 0, 255)
		const result = applyMappedHueRotate(input, map, 180)
		expect(result.data[0]).toBe(255)
		expect(result.data[1]).toBe(0)
		expect(result.data[2]).toBe(0)
	})

	it("all-white map applies full angle", () => {
		const input = pixel(255, 0, 0, 255)
		const map = pixel(255, 255, 255, 255)
		const result = applyMappedHueRotate(input, map, 180)
		expect(result.data[0]).toBe(0)
		expect(result.data[1]).toBe(255)
		expect(result.data[2]).toBe(255)
	})
})
