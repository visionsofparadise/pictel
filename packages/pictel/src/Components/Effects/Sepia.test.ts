import { describe, it, expect, beforeAll } from "vitest"
import { applySepia } from "./Sepia"

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

describe("applySepia", () => {
	it("amount 1 applies full sepia matrix", () => {
		const result = applySepia(pixel(100, 150, 200, 255), 1)
		const expectedR = Math.min(255, 0.393 * 100 + 0.769 * 150 + 0.189 * 200)
		const expectedG = Math.min(255, 0.349 * 100 + 0.686 * 150 + 0.168 * 200)
		const expectedB = Math.min(255, 0.272 * 100 + 0.534 * 150 + 0.131 * 200)
		expect(Math.abs(result.data[0]! - expectedR)).toBeLessThanOrEqual(1)
		expect(Math.abs(result.data[1]! - expectedG)).toBeLessThanOrEqual(1)
		expect(Math.abs(result.data[2]! - expectedB)).toBeLessThanOrEqual(1)
	})

	it("amount 0 is identity", () => {
		const result = applySepia(pixel(100, 150, 200, 255), 0)
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(150)
		expect(result.data[2]).toBe(200)
	})

	it("preserves alpha", () => {
		const result = applySepia(pixel(100, 150, 200, 42), 1)
		expect(result.data[3]).toBe(42)
	})

	it("does not mutate input", () => {
		const input = pixel(100, 150, 200, 255)
		const originalData = new Uint8ClampedArray(input.data)
		applySepia(input, 1)
		expect(input.data).toEqual(originalData)
	})
})
