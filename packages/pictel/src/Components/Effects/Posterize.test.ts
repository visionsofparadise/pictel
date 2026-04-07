import { describe, it, expect, beforeAll } from "vitest"
import { applyPosterize, applyMappedPosterize } from "./Posterize"

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

describe("applyPosterize", () => {
	it("levels=2 produces binary output (0 or 255)", () => {
		const result = applyPosterize(pixel(100, 200, 127, 255), 2)
		// 100/255 = 0.392 -> round(0.392*1)/1*255 = 0
		// 200/255 = 0.784 -> round(0.784*1)/1*255 = 255
		// 127/255 = 0.498 -> round(0.498*1)/1*255 = 0
		expect(result.data[0]).toBe(0)
		expect(result.data[1]).toBe(255)
		expect(result.data[2]).toBe(0)
	})

	it("levels=256 output equals input", () => {
		const result = applyPosterize(pixel(42, 128, 200, 255), 256)
		expect(result.data[0]).toBe(42)
		expect(result.data[1]).toBe(128)
		expect(result.data[2]).toBe(200)
	})

	it("levels=4 maps value 100 correctly", () => {
		// 100/255 = 0.392, * 3 = 1.176, round = 1, / 3 * 255 = 85
		const result = applyPosterize(pixel(100, 100, 100, 255), 4)
		expect(result.data[0]).toBe(85)
	})

	it("preserves alpha unchanged", () => {
		const result = applyPosterize(pixel(100, 100, 100, 77), 4)
		expect(result.data[3]).toBe(77)
	})
})

function uniformImage(width: number, height: number, r: number, g: number, b: number, a: number): ImageData {
	const data = new Uint8ClampedArray(width * height * 4)
	for (let i = 0; i < data.length; i += 4) {
		data[i] = r
		data[i + 1] = g
		data[i + 2] = b
		data[i + 3] = a
	}
	return new ImageData(data, width, height)
}

describe("applyMappedPosterize", () => {
	it("all-black map produces maximum posterization (2 levels)", () => {
		const input = pixel(100, 200, 150, 255)
		const map = pixel(0, 0, 0, 255)
		const result = applyMappedPosterize(input, map, 16)
		// Black map = luminance 0 → levels = 2 → binary output
		// 100/255 = 0.392, round(0.392*1)/1*255 = 0
		// 200/255 = 0.784, round(0.784*1)/1*255 = 255
		// 150/255 = 0.588, round(0.588*1)/1*255 = 255
		expect(result.data[0]).toBe(0)
		expect(result.data[1]).toBe(255)
		expect(result.data[2]).toBe(255)
	})

	it("all-white map produces full levels (minimal posterization)", () => {
		const input = pixel(100, 200, 150, 255)
		const map = pixel(255, 255, 255, 255)
		const result = applyMappedPosterize(input, map, 256)
		// White map = luminance 1 → levels = 256 → output ≈ input
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(200)
		expect(result.data[2]).toBe(150)
	})

	it("gradient map produces varying posterization", () => {
		// 2-pixel image: first pixel with black map, second with white map
		const input = new ImageData(new Uint8ClampedArray([100, 100, 100, 255, 100, 100, 100, 255]), 2, 1)
		const map = new ImageData(new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255]), 2, 1)
		const result = applyMappedPosterize(input, map, 16)
		// Black map pixel → 2 levels: 100/255=0.392, round(0.392*1)/1*255 = 0
		// White map pixel → 16 levels: 100/255=0.392, round(0.392*15)/15*255 = round(5.88)/15*255 = 6/15*255 = 102
		expect(result.data[0]).toBe(0)
		expect(result.data[4]).toBe(102)
	})

	it("preserves alpha unchanged", () => {
		const input = pixel(100, 100, 100, 77)
		const map = pixel(128, 128, 128, 255)
		const result = applyMappedPosterize(input, map, 8)
		expect(result.data[3]).toBe(77)
	})
})
