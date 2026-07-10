import { describe, it, expect, beforeAll } from "vitest"
import { applyQuantize, applyMappedQuantize, derivePalette } from "./Quantize"

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

function horizontalGradient(width: number): ImageData {
	const data = new Uint8ClampedArray(width * 4)
	for (let x = 0; x < width; x++) {
		const value = Math.round((x / (width - 1)) * 255)
		data[x * 4] = value
		data[x * 4 + 1] = value
		data[x * 4 + 2] = value
		data[x * 4 + 3] = 255
	}
	return new ImageData(data, width, 1)
}

const BLACK: [number, number, number] = [0, 0, 0]
const WHITE: [number, number, number] = [255, 255, 255]
const RED: [number, number, number] = [255, 0, 0]
const GREEN: [number, number, number] = [0, 255, 0]
const BLUE: [number, number, number] = [0, 0, 255]

describe("derivePalette", () => {
	it("derives a palette containing each band's representative color from a 4-color image", () => {
		const data = new Uint8ClampedArray(16 * 16 * 4)
		for (let y = 0; y < 16; y++) {
			for (let x = 0; x < 16; x++) {
				const i = (y * 16 + x) * 4
				const isLeft = x < 8
				const isTop = y < 8
				const color =
					isTop && isLeft ? RED :
					isTop && !isLeft ? GREEN :
					!isTop && isLeft ? BLUE :
					WHITE
				data[i] = color[0]
				data[i + 1] = color[1]
				data[i + 2] = color[2]
				data[i + 3] = 255
			}
		}
		const image = new ImageData(data, 16, 16)
		const palette = derivePalette(image, 4)

		expect(palette).toHaveLength(4)
		for (const expected of [RED, GREEN, BLUE, WHITE]) {
			const found = palette.some(
				(p) => Math.abs(p[0] - expected[0]) < 5 && Math.abs(p[1] - expected[1]) < 5 && Math.abs(p[2] - expected[2]) < 5,
			)
			expect(found).toBe(true)
		}
	})

	it("throws when the image has fewer unique colors than count", () => {
		const image = uniformImage(4, 4, 100, 100, 100, 255)
		expect(() => derivePalette(image, 4)).toThrow(/unique color/)
	})
})

describe("applyQuantize (dither: none)", () => {
	it("maps a pure red pixel to the red palette entry", () => {
		const result = applyQuantize(pixel(250, 10, 5, 255), [RED, GREEN, BLUE], "none")
		expect(result.data[0]).toBe(255)
		expect(result.data[1]).toBe(0)
		expect(result.data[2]).toBe(0)
	})

	it("snaps a near-mid-gray pixel to white when palette is B/W and value is above midpoint", () => {
		const result = applyQuantize(pixel(200, 200, 200, 255), [BLACK, WHITE], "none")
		expect(result.data[0]).toBe(255)
		expect(result.data[1]).toBe(255)
		expect(result.data[2]).toBe(255)
	})

	it("snaps a near-mid-gray pixel to black when below midpoint", () => {
		const result = applyQuantize(pixel(50, 50, 50, 255), [BLACK, WHITE], "none")
		expect(result.data[0]).toBe(0)
	})

	it("preserves alpha unchanged", () => {
		const result = applyQuantize(pixel(128, 128, 128, 77), [BLACK, WHITE], "none")
		expect(result.data[3]).toBe(77)
	})
})

describe("applyQuantize (dither: floyd-steinberg)", () => {
	it("a horizontal gradient quantized to B/W produces mostly-black left, mostly-white right", () => {
		const input = horizontalGradient(256)
		const result = applyQuantize(input, [BLACK, WHITE], "floyd-steinberg")

		let leftBlack = 0
		let rightWhite = 0
		for (let x = 0; x < 64; x++) {
			if (result.data[x * 4] === 0) leftBlack++
		}
		for (let x = 192; x < 256; x++) {
			if (result.data[x * 4] === 255) rightWhite++
		}

		expect(leftBlack).toBeGreaterThan(50)
		expect(rightWhite).toBeGreaterThan(50)
	})

	it("a horizontal gradient produces ~50/50 black/white in the middle quartile", () => {
		const input = horizontalGradient(256)
		const result = applyQuantize(input, [BLACK, WHITE], "floyd-steinberg")

		let midWhite = 0
		for (let x = 96; x < 160; x++) {
			if (result.data[x * 4] === 255) midWhite++
		}
		expect(midWhite).toBeGreaterThan(16)
		expect(midWhite).toBeLessThan(48)
	})
})

describe("applyQuantize (dither: atkinson)", () => {
	it("produces a dithered output different from Floyd–Steinberg on the same input", () => {
		const input = uniformImage(32, 32, 128, 128, 128, 255)
		const fs = applyQuantize(input, [BLACK, WHITE], "floyd-steinberg")
		const atk = applyQuantize(input, [BLACK, WHITE], "atkinson")

		let differingPixels = 0
		for (let i = 0; i < fs.data.length; i += 4) {
			if (fs.data[i] !== atk.data[i]) differingPixels++
		}

		expect(differingPixels).toBeGreaterThan(0)
	})

	it("preserves highlights better than Floyd–Steinberg on a bright gray field", () => {
		const input = uniformImage(64, 64, 200, 200, 200, 255)
		const fs = applyQuantize(input, [BLACK, WHITE], "floyd-steinberg")
		const atk = applyQuantize(input, [BLACK, WHITE], "atkinson")

		let fsWhite = 0
		let atkWhite = 0
		for (let i = 0; i < fs.data.length; i += 4) {
			if (fs.data[i] === 255) fsWhite++
			if (atk.data[i] === 255) atkWhite++
		}

		expect(atkWhite).toBeGreaterThan(fsWhite)
	})
})

describe("applyQuantize (dither: bayer)", () => {
	it("bayer-4 is deterministic for the same input", () => {
		const input = uniformImage(16, 16, 128, 128, 128, 255)
		const a = applyQuantize(input, [BLACK, WHITE], "bayer-4")
		const b = applyQuantize(input, [BLACK, WHITE], "bayer-4")

		expect(Array.from(a.data)).toEqual(Array.from(b.data))
	})

	it("bayer-8 is deterministic for the same input", () => {
		const input = uniformImage(16, 16, 128, 128, 128, 255)
		const a = applyQuantize(input, [BLACK, WHITE], "bayer-8")
		const b = applyQuantize(input, [BLACK, WHITE], "bayer-8")

		expect(Array.from(a.data)).toEqual(Array.from(b.data))
	})

	it("bayer-4 produces both black and white pixels on a uniform mid-gray", () => {
		const input = uniformImage(8, 8, 128, 128, 128, 255)
		const result = applyQuantize(input, [BLACK, WHITE], "bayer-4")

		let blackCount = 0
		let whiteCount = 0
		for (let i = 0; i < result.data.length; i += 4) {
			if (result.data[i] === 0) blackCount++
			if (result.data[i] === 255) whiteCount++
		}
		expect(blackCount).toBeGreaterThan(0)
		expect(whiteCount).toBeGreaterThan(0)
	})
})

describe("applyMappedQuantize", () => {
	it("returns the original pixel where the map is black", () => {
		const input = pixel(120, 60, 30, 255)
		const map = pixel(0, 0, 0, 255)
		const result = applyMappedQuantize(input, map, [BLACK, WHITE], "none")
		expect(result.data[0]).toBe(120)
		expect(result.data[1]).toBe(60)
		expect(result.data[2]).toBe(30)
	})

	it("returns the quantized pixel where the map is white", () => {
		const input = pixel(200, 200, 200, 255)
		const map = pixel(255, 255, 255, 255)
		const result = applyMappedQuantize(input, map, [BLACK, WHITE], "none")
		expect(result.data[0]).toBe(255)
		expect(result.data[1]).toBe(255)
		expect(result.data[2]).toBe(255)
	})
})
