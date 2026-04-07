import { beforeAll, describe, expect, it } from "vitest"
import { applyVariableBlur } from "./variable-blur"

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

describe("applyVariableBlur", () => {
	it("all-black map produces no blur with zero overflow", () => {
		const input = solidImage(3, 3, 100, 150, 200, 255)
		const map = solidImage(3, 3, 0, 0, 0, 255) // black = luminance 0

		const result = applyVariableBlur(input, map, 5)

		expect(result.overflow).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
		expect(result.pixels.width).toBe(3)
		expect(result.pixels.height).toBe(3)

		// Output should be identical to input since effective radius is 0 everywhere.
		for (let i = 0; i < input.data.length; i++) {
			expect(result.pixels.data[i]).toBe(input.data[i])
		}
	})

	it("all-white map produces blur equivalent to full radius", () => {
		const input = pixel(200, 100, 50, 255)
		const map = pixel(255, 255, 255, 255) // white = luminance 255

		const result = applyVariableBlur(input, map, 2)

		// Peak luminance is 255, so maxRadius = ceil(1 * 2) = 2.
		expect(result.overflow).toEqual({ top: 2, right: 2, bottom: 2, left: 2 })
		expect(result.pixels.width).toBe(5)
		expect(result.pixels.height).toBe(5)
	})

	it("half-black half-white map blurs only the white region", () => {
		// 4x1 image: uniform color.
		const input = solidImage(4, 1, 200, 200, 200, 255)

		// Map: left half black, right half white.
		const mapData = new Uint8ClampedArray(4 * 1 * 4)

		for (let x = 0; x < 4; x++) {
			const v = x < 2 ? 0 : 255
			mapData[x * 4] = v
			mapData[x * 4 + 1] = v
			mapData[x * 4 + 2] = v
			mapData[x * 4 + 3] = 255
		}

		const map = new ImageData(mapData, 4, 1)
		const result = applyVariableBlur(input, map, 1)

		// Peak luminance is 255, maxRadius = 1. Output is 6x3.
		const maxR = 1
		const outW = 4 + 2 * maxR

		// Left-half source pixels (x=0, x=1) have black map => effectiveR=0 => unblurred.
		// They should match the original value exactly.
		// In output coords, source (0,0) is at output (maxR, maxR) = (1, 1).
		for (let sx = 0; sx < 2; sx++) {
			const ox = sx + maxR
			const oy = maxR
			const idx = (oy * outW + ox) * 4

			expect(result.pixels.data[idx]).toBe(200)
			expect(result.pixels.data[idx + 3]).toBe(255)
		}

		// Right-half source pixels (x=2, x=3) have white map => effectiveR=1 => blurred.
		// Blurred pixels average with transparent border, so values should be lower.
		for (let sx = 2; sx < 4; sx++) {
			const ox = sx + maxR
			const oy = maxR
			const idx = (oy * outW + ox) * 4

			expect(result.pixels.data[idx]).toBeLessThan(200)
		}
	})

	it("overflow equals ceil(peakMapLuminance/255 * radius)", () => {
		const input = solidImage(2, 2, 100, 100, 100, 255)

		// Map with mid-gray: luminance of (128,128,128) ~ 128.
		const map = solidImage(2, 2, 128, 128, 128, 255)

		const result = applyVariableBlur(input, map, 10)
		const expectedOverflow = Math.ceil((128 / 255) * 10)

		expect(result.overflow?.top).toBe(expectedOverflow)
		expect(result.overflow?.right).toBe(expectedOverflow)
		expect(result.overflow?.bottom).toBe(expectedOverflow)
		expect(result.overflow?.left).toBe(expectedOverflow)
	})

	it("does not mutate input or map", () => {
		const input = solidImage(2, 2, 100, 150, 200, 255)
		const map = solidImage(2, 2, 255, 255, 255, 255)
		const origInput = new Uint8ClampedArray(input.data)
		const origMap = new Uint8ClampedArray(map.data)

		applyVariableBlur(input, map, 2)

		expect(input.data).toEqual(origInput)
		expect(map.data).toEqual(origMap)
	})
})
