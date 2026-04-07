import { beforeAll, describe, expect, it } from "vitest"
import { applyUniformBlur } from "./uniform-blur"

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

function solidImage(
	w: number,
	h: number,
	r: number,
	g: number,
	b: number,
	a: number,
): ImageData {
	const data = new Uint8ClampedArray(w * h * 4)

	for (let i = 0; i < w * h; i++) {
		data[i * 4] = r
		data[i * 4 + 1] = g
		data[i * 4 + 2] = b
		data[i * 4 + 3] = a
	}

	return new ImageData(data, w, h)
}

describe("applyUniformBlur", () => {
	it("radius 0 returns input unchanged with zero overflow", () => {
		const input = pixel(100, 150, 200, 255)
		const result = applyUniformBlur(input, 0)

		expect(result.pixels.width).toBe(1)
		expect(result.pixels.height).toBe(1)
		expect(Array.from(result.pixels.data)).toEqual(Array.from(input.data))
		expect(result.overflow).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
	})

	it("single pixel with radius 1 produces 3x3 output", () => {
		const input = pixel(255, 0, 0, 255)
		const result = applyUniformBlur(input, 1)

		expect(result.pixels.width).toBe(3)
		expect(result.pixels.height).toBe(3)
		expect(result.overflow).toEqual({ top: 1, right: 1, bottom: 1, left: 1 })

		// Center pixel (1,1) should have the highest value since it's the
		// source pixel averaged with transparent neighbors.
		const centerIdx = (1 * 3 + 1) * 4

		expect(result.pixels.data[centerIdx]).toBeGreaterThan(0)
	})

	it("2x2 solid pixels with radius 1 averages correctly with transparent border", () => {
		const input = solidImage(2, 2, 180, 180, 180, 255)
		const result = applyUniformBlur(input, 1)

		expect(result.pixels.width).toBe(4)
		expect(result.pixels.height).toBe(4)
		expect(result.overflow).toEqual({ top: 1, right: 1, bottom: 1, left: 1 })

		// Center pixels (1,1), (1,2), (2,1), (2,2) correspond to the original
		// 2x2 pixels and should have higher values than corner pixels.
		const cornerIdx = 0 * 4 // (0,0)
		const centerIdx = (1 * 4 + 1) * 4 // (1,1)

		expect(result.pixels.data[centerIdx]).toBeGreaterThan(result.pixels.data[cornerIdx]!)
	})

	it("transparent pixels beyond bounds contribute zero to average", () => {
		// A single opaque white pixel blurred with radius 1.
		// The alpha channel should be diluted by the transparent neighbors.
		const input = pixel(255, 255, 255, 255)
		const result = applyUniformBlur(input, 1)

		// Corner pixel at (0,0): no source pixel is within the kernel center for most positions.
		// The alpha at the center should be less than 255 due to averaging with transparent pixels.
		const centerIdx = (1 * 3 + 1) * 4
		const centerAlpha = result.pixels.data[centerIdx + 3]

		expect(centerAlpha).toBeLessThan(255)
		expect(centerAlpha).toBeGreaterThan(0)
	})

	it("does not mutate input", () => {
		const input = pixel(100, 150, 200, 255)
		const original = new Uint8ClampedArray(input.data)
		applyUniformBlur(input, 2)

		expect(input.data).toEqual(original)
	})
})
