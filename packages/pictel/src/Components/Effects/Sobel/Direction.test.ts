import { describe, it, expect, beforeAll } from "vitest"
import { applyDirection } from "./Direction"

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

function uniform(width: number, height: number, value: number, alpha = 255): ImageData {
	const data = new Uint8ClampedArray(width * height * 4)
	for (let i = 0; i < width * height; i++) {
		data[i * 4] = value
		data[i * 4 + 1] = value
		data[i * 4 + 2] = value
		data[i * 4 + 3] = alpha
	}
	return new ImageData(data, width, height)
}

function verticalEdge(size: number, alpha = 255): ImageData {
	// Left half black, right half white -- gradient points horizontally (+x).
	const data = new Uint8ClampedArray(size * size * 4)
	const mid = size / 2
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4
			const v = x < mid ? 0 : 255
			data[i] = v
			data[i + 1] = v
			data[i + 2] = v
			data[i + 3] = alpha
		}
	}
	return new ImageData(data, size, size)
}

function horizontalEdge(size: number, alpha = 255): ImageData {
	// Top half black, bottom half white -- gradient points vertically (+y).
	const data = new Uint8ClampedArray(size * size * 4)
	const mid = size / 2
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4
			const v = y < mid ? 0 : 255
			data[i] = v
			data[i + 1] = v
			data[i + 2] = v
			data[i + 3] = alpha
		}
	}
	return new ImageData(data, size, size)
}

describe("applyDirection", () => {
	it("uniform image emits neutral direction with zero magnitude", () => {
		const input = uniform(8, 8, 120)
		const result = applyDirection(input, "sobel")
		for (let i = 0; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(128) // R = cos(0) packed = 0 packed = 128
			expect(result.data[i + 1]).toBe(128) // G = sin(0) packed = 0 packed = 128
			expect(result.data[i + 2]).toBe(0) // B = magnitude = 0
		}
	})

	it("vertical edge -> gradient points right (cos~1, sin~0)", () => {
		const size = 16
		const input = verticalEdge(size)
		const result = applyDirection(input, "sobel")

		// Sample the boundary column at an interior row.
		const px = (8 * size + 7) * 4
		const r = result.data[px]!
		const g = result.data[px + 1]!
		const b = result.data[px + 2]!

		// cos near +1 -> R near 255
		expect(r).toBeGreaterThan(250)
		// sin near 0 -> G near 128
		expect(g).toBeGreaterThanOrEqual(126)
		expect(g).toBeLessThanOrEqual(130)
		// magnitude > 0
		expect(b).toBeGreaterThan(0)
	})

	it("horizontal edge -> gradient points down (cos~0, sin~1)", () => {
		const size = 16
		const input = horizontalEdge(size)
		const result = applyDirection(input, "sobel")

		const px = (7 * size + 8) * 4
		const r = result.data[px]!
		const g = result.data[px + 1]!
		const b = result.data[px + 2]!

		// cos near 0 -> R near 128
		expect(r).toBeGreaterThanOrEqual(126)
		expect(r).toBeLessThanOrEqual(130)
		// sin near +1 -> G near 255
		expect(g).toBeGreaterThan(250)
		// magnitude > 0
		expect(b).toBeGreaterThan(0)
	})

	it("decoded cos/sin form a unit vector at a known edge sample", () => {
		const size = 16
		const input = verticalEdge(size)
		const result = applyDirection(input, "sobel")

		const px = (8 * size + 7) * 4
		const r = result.data[px]!
		const g = result.data[px + 1]!
		const cos = r / 127.5 - 1
		const sin = g / 127.5 - 1
		const length = Math.sqrt(cos * cos + sin * sin)

		// Allow small slack for byte quantization.
		expect(length).toBeGreaterThan(0.99)
		expect(length).toBeLessThan(1.01)
	})

	it("preserves alpha", () => {
		const input = uniform(4, 4, 100, 128)
		const result = applyDirection(input, "sobel")
		for (let i = 3; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(128)
		}
	})
})
