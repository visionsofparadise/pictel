import { describe, it, expect, beforeAll } from "vitest"
import { applyLuminanceBands, applyMappedLuminanceBands } from "./LuminanceBands"

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

function gradient256x1(): ImageData {
	const data = new Uint8ClampedArray(256 * 4)
	for (let x = 0; x < 256; x++) {
		const i = x * 4
		data[i] = x
		data[i + 1] = x
		data[i + 2] = x
		data[i + 3] = 255
	}
	return new ImageData(data, 256, 1)
}

function uniqueLuminances(image: ImageData): Set<number> {
	const result = new Set<number>()
	const data = image.data
	for (let i = 0; i < data.length; i += 4) {
		const lum = Math.round(0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!)
		result.add(lum)
	}
	return result
}

describe("applyLuminanceBands", () => {
	it("bands=256 output near-identical to input", () => {
		const input = pixel(42, 128, 200, 255)
		const result = applyLuminanceBands(input, 256)
		expect(Math.abs(result.data[0]! - 42)).toBeLessThanOrEqual(1)
		expect(Math.abs(result.data[1]! - 128)).toBeLessThanOrEqual(1)
		expect(Math.abs(result.data[2]! - 200)).toBeLessThanOrEqual(1)
	})

	it("preserves color hue while quantizing luminance", () => {
		const result = applyLuminanceBands(pixel(200, 0, 0, 255), 4)
		expect(result.data[0]).toBeGreaterThan(result.data[1]! + 50)
		expect(result.data[0]).toBeGreaterThan(result.data[2]! + 50)
		const yIn = 0.299 * 200
		const yOut = 0.299 * result.data[0]! + 0.587 * result.data[1]! + 0.114 * result.data[2]!
		expect(Math.abs(yOut - yIn)).toBeGreaterThan(1)
	})

	it("bands=4 over a smooth grayscale gradient produces exactly 4 unique luminances", () => {
		const result = applyLuminanceBands(gradient256x1(), 4)
		const unique = uniqueLuminances(result)
		expect(unique.size).toBe(4)
	})

	it("custom thresholds=[64, 192] with bands=3 produces exactly 3 tiers at the expected midpoints", () => {
		const result = applyLuminanceBands(gradient256x1(), 3, [64, 192])
		const unique = [...uniqueLuminances(result)].sort((a, b) => a - b)
		expect(unique.length).toBe(3)
		expect(unique[0]).toBe(32)
		expect(unique[1]).toBe(128)
		expect(unique[2]).toBe(224)
	})

	it("preserves alpha unchanged", () => {
		const result = applyLuminanceBands(pixel(100, 100, 100, 77), 4)
		expect(result.data[3]).toBe(77)
	})
})

describe("applyMappedLuminanceBands", () => {
	it("all-black map returns the original pixels (no banding)", () => {
		const input = pixel(100, 200, 150, 255)
		const map = pixel(0, 0, 0, 255)
		const result = applyMappedLuminanceBands(input, map, 4)
		expect(Math.abs(result.data[0]! - 100)).toBeLessThanOrEqual(1)
		expect(Math.abs(result.data[1]! - 200)).toBeLessThanOrEqual(1)
		expect(Math.abs(result.data[2]! - 150)).toBeLessThanOrEqual(1)
	})

	it("all-white map returns the fully-banded version", () => {
		const input = pixel(100, 200, 150, 255)
		const map = pixel(255, 255, 255, 255)
		const banded = applyLuminanceBands(input, 4)
		const result = applyMappedLuminanceBands(input, map, 4)
		expect(result.data[0]).toBe(banded.data[0])
		expect(result.data[1]).toBe(banded.data[1])
		expect(result.data[2]).toBe(banded.data[2])
	})

	it("gradient map produces a gradient mix between original and banded", () => {
		const input = new ImageData(new Uint8ClampedArray([100, 100, 100, 255, 100, 100, 100, 255]), 2, 1)
		const map = new ImageData(new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 255]), 2, 1)
		const result = applyMappedLuminanceBands(input, map, 4)
		expect(Math.abs(result.data[0]! - 100)).toBeLessThanOrEqual(1)
		expect(result.data[4]).toBe(96)
	})

	it("preserves alpha unchanged", () => {
		const input = pixel(100, 100, 100, 77)
		const map = pixel(128, 128, 128, 255)
		const result = applyMappedLuminanceBands(input, map, 4)
		expect(result.data[3]).toBe(77)
	})
})
