import { describe, it, expect, beforeAll } from "vitest"
import { applyDuotone } from "./Duotone"

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

describe("applyDuotone", () => {
	const dark: [number, number, number] = [20, 40, 60]
	const light: [number, number, number] = [220, 200, 180]

	it("maps pure black to dark color", () => {
		const result = applyDuotone(pixel(0, 0, 0, 255), dark, light)
		expect(result.data[0]).toBe(20)
		expect(result.data[1]).toBe(40)
		expect(result.data[2]).toBe(60)
	})

	it("maps pure white to light color", () => {
		const result = applyDuotone(pixel(255, 255, 255, 255), dark, light)
		expect(result.data[0]).toBe(220)
		expect(result.data[1]).toBe(200)
		expect(result.data[2]).toBe(180)
	})

	it("maps mid-gray to midpoint between dark and light", () => {
		const result = applyDuotone(pixel(128, 128, 128, 255), dark, light)
		const t = 128 / 255
		expect(result.data[0]).toBeCloseTo(20 + t * (220 - 20), 0)
		expect(result.data[1]).toBeCloseTo(40 + t * (200 - 40), 0)
		expect(result.data[2]).toBeCloseTo(60 + t * (180 - 60), 0)
	})

	it("preserves alpha", () => {
		const result = applyDuotone(pixel(100, 100, 100, 42), dark, light)
		expect(result.data[3]).toBe(42)
	})

	it("does not mutate input ImageData", () => {
		const input = pixel(100, 150, 200, 255)
		const originalData = new Uint8ClampedArray(input.data)
		applyDuotone(input, dark, light)
		expect(input.data).toEqual(originalData)
	})
})
