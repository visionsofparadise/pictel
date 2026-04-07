import { describe, it, expect, beforeAll } from "vitest"
import { mixBlend } from "./mix-blend"

beforeAll(() => {
	globalThis.ImageData = class ImageData {
		readonly data: Uint8ClampedArray
		readonly width: number
		readonly height: number

		constructor(widthOrData: number | Uint8ClampedArray, widthOrHeight: number, height?: number) {
			if (widthOrData instanceof Uint8ClampedArray) {
				this.data = widthOrData
				this.width = widthOrHeight
				this.height = height!
			} else {
				this.width = widthOrData
				this.height = widthOrHeight
				this.data = new Uint8ClampedArray(this.width * this.height * 4)
			}
		}
	} as unknown as typeof globalThis.ImageData
})

function pixel(r: number, g: number, b: number, a: number): ImageData {
	return new ImageData(new Uint8ClampedArray([r, g, b, a]), 1, 1)
}

describe("mixBlend", () => {
	it("white map returns result pixels", () => {
		const original = pixel(0, 0, 0, 255)
		const result = pixel(255, 128, 64, 255)
		const map = pixel(255, 255, 255, 255)

		const output = mixBlend(original, result, map)
		expect(output.data[0]).toBe(255)
		expect(output.data[1]).toBe(128)
		expect(output.data[2]).toBe(64)
		expect(output.data[3]).toBe(255)
	})

	it("black map returns original pixels", () => {
		const original = pixel(255, 128, 64, 200)
		const result = pixel(0, 0, 0, 255)
		const map = pixel(0, 0, 0, 255)

		const output = mixBlend(original, result, map)
		expect(output.data[0]).toBe(255)
		expect(output.data[1]).toBe(128)
		expect(output.data[2]).toBe(64)
		expect(output.data[3]).toBe(200)
	})

	it("50% gray map returns midpoint between original and result", () => {
		const original = pixel(0, 0, 0, 0)
		const result = pixel(200, 100, 50, 200)
		// BT.601: 0.299*128 + 0.587*128 + 0.114*128 = 128, factor = 128/255 ≈ 0.502
		const map = pixel(128, 128, 128, 255)

		const output = mixBlend(original, result, map)
		const factor = 128 / 255
		expect(output.data[0]).toBeCloseTo(factor * 200, 0)
		expect(output.data[1]).toBeCloseTo(factor * 100, 0)
		expect(output.data[2]).toBeCloseTo(factor * 50, 0)
		expect(output.data[3]).toBeCloseTo(factor * 200, 0)
	})

	it("lerps alpha based on map luminance", () => {
		const original = pixel(100, 100, 100, 0)
		const result = pixel(100, 100, 100, 255)
		const map = pixel(255, 255, 255, 255)

		const output = mixBlend(original, result, map)
		expect(output.data[3]).toBe(255)

		const map2 = pixel(0, 0, 0, 255)
		const output2 = mixBlend(original, result, map2)
		expect(output2.data[3]).toBe(0)
	})

	it("throws on dimension mismatch", () => {
		const a = new ImageData(new Uint8ClampedArray(8), 2, 1)
		const b = new ImageData(new Uint8ClampedArray(4), 1, 1)
		const c = new ImageData(new Uint8ClampedArray(4), 1, 1)

		expect(() => mixBlend(a, b, c)).toThrow("dimension mismatch")
	})

	it("does not mutate inputs", () => {
		const original = pixel(10, 20, 30, 40)
		const result = pixel(200, 180, 160, 140)
		const map = pixel(128, 128, 128, 255)

		const origCopy = new Uint8ClampedArray(original.data)
		const resultCopy = new Uint8ClampedArray(result.data)
		const mapCopy = new Uint8ClampedArray(map.data)

		mixBlend(original, result, map)

		expect(original.data).toEqual(origCopy)
		expect(result.data).toEqual(resultCopy)
		expect(map.data).toEqual(mapCopy)
	})
})
