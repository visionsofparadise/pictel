import { describe, it, expect, beforeAll } from "vitest"
import { applySharpen, applyMappedSharpen } from "./Sharpen"

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

function uniform3x3(r: number, g: number, b: number, a: number): ImageData {
	const data = new Uint8ClampedArray(9 * 4)
	for (let i = 0; i < 9; i++) {
		data[i * 4] = r
		data[i * 4 + 1] = g
		data[i * 4 + 2] = b
		data[i * 4 + 3] = a
	}
	return new ImageData(data, 3, 3)
}

describe("applySharpen", () => {
	it("amount=0 returns identical output", () => {
		const input = pixel(100, 150, 200, 255)
		const result = applySharpen(input, 0)
		expect(Array.from(result.data)).toEqual(Array.from(input.data))
	})

	it("uniform image is unchanged", () => {
		const input = uniform3x3(120, 80, 200, 255)
		const result = applySharpen(input, 1)
		for (let i = 0; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(120)
			expect(result.data[i + 1]).toBe(80)
			expect(result.data[i + 2]).toBe(200)
		}
	})

	it("enhances contrast at an edge", () => {
		// 3x3 image: left column dark (50), right two columns bright (200)
		const data = new Uint8ClampedArray(9 * 4)
		for (let y = 0; y < 3; y++) {
			for (let x = 0; x < 3; x++) {
				const i = (y * 3 + x) * 4
				const v = x === 0 ? 50 : 200
				data[i] = v
				data[i + 1] = v
				data[i + 2] = v
				data[i + 3] = 255
			}
		}
		const input = new ImageData(data, 3, 3)
		const result = applySharpen(input, 1)

		// Center pixel (1,1) is bright 200, neighbor at (0,1) is dark 50
		// Sharpening should push center brighter (or clamp at 255)
		const centerIdx = (1 * 3 + 1) * 4
		expect(result.data[centerIdx]!).toBeGreaterThanOrEqual(200)

		// Edge pixel (0,1) dark, neighbor (1,1) is bright — should get darker
		const edgeIdx = (1 * 3 + 0) * 4
		expect(result.data[edgeIdx]!).toBeLessThanOrEqual(50)
	})

	it("preserves alpha", () => {
		const input = pixel(100, 150, 200, 42)
		const result = applySharpen(input, 1)
		expect(result.data[3]).toBe(42)
	})

	it("does not mutate input", () => {
		const input = pixel(100, 150, 200, 255)
		const original = new Uint8ClampedArray(input.data)
		applySharpen(input, 1)
		expect(input.data).toEqual(original)
	})
})

describe("applyMappedSharpen", () => {
	it("all-black map produces no sharpening (identity)", () => {
		const input = uniform3x3(120, 80, 200, 255)
		const map = uniform3x3(0, 0, 0, 255)
		const result = applyMappedSharpen(input, map, 2)
		// Black map → amount = 0 for every pixel → identity
		for (let i = 0; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(120)
			expect(result.data[i + 1]).toBe(80)
			expect(result.data[i + 2]).toBe(200)
		}
	})

	it("all-white map produces full sharpening", () => {
		const input = uniform3x3(120, 80, 200, 255)
		const map = uniform3x3(255, 255, 255, 255)
		const result = applyMappedSharpen(input, map, 1)
		// White map → amount = 1 for every pixel → same as applySharpen(input, 1)
		const reference = applySharpen(input, 1)
		expect(Array.from(result.data)).toEqual(Array.from(reference.data))
	})

	it("gradient map produces varying sharpening at edges", () => {
		// 3x3 image: left column dark (50), right two columns bright (200)
		const data = new Uint8ClampedArray(9 * 4)
		for (let y = 0; y < 3; y++) {
			for (let x = 0; x < 3; x++) {
				const i = (y * 3 + x) * 4
				const v = x === 0 ? 50 : 200
				data[i] = v
				data[i + 1] = v
				data[i + 2] = v
				data[i + 3] = 255
			}
		}
		const input = new ImageData(data, 3, 3)

		// Map: left column black (no sharpen), right columns white (full sharpen)
		const mapData = new Uint8ClampedArray(9 * 4)
		for (let y = 0; y < 3; y++) {
			for (let x = 0; x < 3; x++) {
				const i = (y * 3 + x) * 4
				const v = x === 0 ? 0 : 255
				mapData[i] = v
				mapData[i + 1] = v
				mapData[i + 2] = v
				mapData[i + 3] = 255
			}
		}
		const map = new ImageData(mapData, 3, 3)

		const result = applyMappedSharpen(input, map, 1)

		// Left column (x=0) has black map → amount=0 → identity: value stays 50
		const leftCenter = (1 * 3 + 0) * 4
		expect(result.data[leftCenter]).toBe(50)

		// Center pixel (1,1) has white map → full sharpen → should be >= 200
		const centerIdx = (1 * 3 + 1) * 4
		expect(result.data[centerIdx]!).toBeGreaterThanOrEqual(200)
	})

	it("preserves alpha unchanged", () => {
		const input = uniform3x3(100, 150, 200, 42)
		const map = uniform3x3(128, 128, 128, 255)
		const result = applyMappedSharpen(input, map, 1)
		for (let i = 3; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(42)
		}
	})
})
