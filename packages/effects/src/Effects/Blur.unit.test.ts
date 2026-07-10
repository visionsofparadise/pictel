import { beforeAll, describe, expect, it } from "vitest"
import { applyUniformBlur, applyVariableBlur } from "./Blur"

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

		const centerIdx = (1 * 3 + 1) * 4

		expect(result.pixels.data[centerIdx]).toBeGreaterThan(0)
	})

	it("2x2 solid pixels with radius 1 produces uniform output via edge clamping", () => {
		const input = solidImage(2, 2, 180, 180, 180, 255)
		const result = applyUniformBlur(input, 1)

		expect(result.pixels.width).toBe(4)
		expect(result.pixels.height).toBe(4)
		expect(result.overflow).toEqual({ top: 1, right: 1, bottom: 1, left: 1 })

		for (let i = 0; i < result.pixels.data.length; i += 4) {
			expect(result.pixels.data[i]).toBe(180)
		}
	})

	it("edge-clamped single pixel preserves value uniformly", () => {
		const input = pixel(255, 255, 255, 255)
		const result = applyUniformBlur(input, 1)

		const centerIdx = (1 * 3 + 1) * 4
		const centerAlpha = result.pixels.data[centerIdx + 3]

		expect(centerAlpha).toBe(255)
	})

	it("does not mutate input", () => {
		const input = pixel(100, 150, 200, 255)
		const original = new Uint8ClampedArray(input.data)
		applyUniformBlur(input, 2)

		expect(input.data).toEqual(original)
	})
})

describe("applyVariableBlur", () => {
	it("all-black map produces no blur with zero overflow", () => {
		const input = solidImage(3, 3, 100, 150, 200, 255)
		const map = solidImage(3, 3, 0, 0, 0, 255)

		const result = applyVariableBlur(input, map, 5)

		expect(result.overflow).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
		expect(result.pixels.width).toBe(3)
		expect(result.pixels.height).toBe(3)

		for (let i = 0; i < input.data.length; i++) {
			expect(result.pixels.data[i]).toBe(input.data[i])
		}
	})

	it("all-white map produces blur equivalent to full radius", () => {
		const input = pixel(200, 100, 50, 255)
		const map = pixel(255, 255, 255, 255)

		const result = applyVariableBlur(input, map, 2)

		expect(result.overflow).toEqual({ top: 2, right: 2, bottom: 2, left: 2 })
		expect(result.pixels.width).toBe(5)
		expect(result.pixels.height).toBe(5)
	})

	it("half-black half-white map blurs only the white region", () => {
		const input = solidImage(4, 1, 200, 200, 200, 255)

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

		const maxR = 1
		const outW = 4 + 2 * maxR

		for (let sx = 0; sx < 2; sx++) {
			const ox = sx + maxR
			const oy = maxR
			const idx = (oy * outW + ox) * 4

			expect(result.pixels.data[idx]).toBe(200)
			expect(result.pixels.data[idx + 3]).toBe(255)
		}

		expect(result.pixels.width).toBe(outW)
		expect(result.pixels.height).toBe(3)
	})

	it("overflow equals ceil(peakMapLuminance/255 * radius)", () => {
		const input = solidImage(2, 2, 100, 100, 100, 255)

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
