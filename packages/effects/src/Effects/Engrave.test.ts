import { describe, it, expect, beforeAll } from "vitest"
import { applyEngrave } from "./Engrave"

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

/** Build a `size`×`size` image filled with a uniform RGBA value. */
function uniform(size: number, red: number, green: number, blue: number, alpha: number): ImageData {
	const data = new Uint8ClampedArray(size * size * 4)

	for (let px = 0; px < data.length; px += 4) {
		data[px] = red
		data[px + 1] = green
		data[px + 2] = blue
		data[px + 3] = alpha
	}

	return new ImageData(data, size, size)
}

describe("applyEngrave", () => {
	it("leaves a pure-white image as blank white paper — no ink", () => {
		const result = applyEngrave(uniform(16, 255, 255, 255, 255), 6, 0, 0, true)

		for (let px = 0; px < result.data.length; px += 4) {
			expect(result.data[px]).toBe(255)
			expect(result.data[px + 1]).toBe(255)
			expect(result.data[px + 2]).toBe(255)
		}
	})

	it("inks a pure-black image — most pixels are dark", () => {
		const result = applyEngrave(uniform(16, 0, 0, 0, 255), 6, 0, 0, true)

		let darkPixels = 0

		for (let px = 0; px < result.data.length; px += 4) {
			if ((result.data[px] ?? 255) < 64) darkPixels++
		}

		expect(darkPixels).toBeGreaterThan(0)
	})

	it("produces a grayscale result — R, G and B are equal per pixel", () => {
		const result = applyEngrave(uniform(16, 200, 90, 40, 255), 5, 0, 4, true)

		for (let px = 0; px < result.data.length; px += 4) {
			expect(result.data[px]).toBe(result.data[px + 1])
			expect(result.data[px + 1]).toBe(result.data[px + 2])
		}
	})

	it("preserves the source alpha channel", () => {
		const result = applyEngrave(uniform(8, 128, 128, 128, 137), 6, 0, 0, true)

		for (let px = 3; px < result.data.length; px += 4) {
			expect(result.data[px]).toBe(137)
		}
	})

	it("preserves image dimensions", () => {
		const result = applyEngrave(uniform(12, 128, 128, 128, 255), 6, 0, 0, false)

		expect(result.width).toBe(12)
		expect(result.height).toBe(12)
	})

	it("a mid-gray image yields both inked and blank pixels (line pattern present)", () => {
		const result = applyEngrave(uniform(24, 128, 128, 128, 255), 6, 0, 0, false)

		let inked = 0
		let blank = 0

		for (let px = 0; px < result.data.length; px += 4) {
			if ((result.data[px] ?? 0) < 128) inked++
			else blank++
		}

		expect(inked).toBeGreaterThan(0)
		expect(blank).toBeGreaterThan(0)
	})
})
