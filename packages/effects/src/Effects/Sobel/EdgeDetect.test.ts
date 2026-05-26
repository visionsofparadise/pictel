import { describe, it, expect, beforeAll } from "vitest"
import { applyEdgeDetect } from "./EdgeDetect"

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

function diagonalEdge(size: number, alpha = 255): ImageData {
	const data = new Uint8ClampedArray(size * size * 4)
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4
			const v = y > x ? 255 : 0
			data[i] = v
			data[i + 1] = v
			data[i + 2] = v
			data[i + 3] = alpha
		}
	}
	return new ImageData(data, size, size)
}

describe("applyEdgeDetect", () => {
	it("uniform image produces all-zero output", () => {
		const input = uniform(8, 8, 120)
		const result = applyEdgeDetect(input, "sobel")
		for (let i = 0; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(0)
			expect(result.data[i + 1]).toBe(0)
			expect(result.data[i + 2]).toBe(0)
		}
	})

	it("sharp vertical edge produces high magnitude at the boundary columns", () => {
		const size = 16
		const input = verticalEdge(size)
		const result = applyEdgeDetect(input, "sobel")

		for (let y = 2; y < size - 2; y++) {
			const left = result.data[(y * size + 7) * 4]!
			const right = result.data[(y * size + 8) * 4]!
			expect(left).toBeGreaterThan(150)
			expect(right).toBeGreaterThan(150)
		}

		for (let y = 2; y < size - 2; y++) {
			const farLeft = result.data[(y * size + 2) * 4]!
			const farRight = result.data[(y * size + size - 3) * 4]!
			expect(farLeft).toBe(0)
			expect(farRight).toBe(0)
		}
	})

	it("diagonal edge produces high magnitude along the diagonal", () => {
		const size = 16
		const input = diagonalEdge(size)
		const result = applyEdgeDetect(input, "sobel")

		for (let i = 3; i < size - 3; i++) {
			const onDiagonal = result.data[(i * size + i) * 4]!
			expect(onDiagonal).toBeGreaterThan(100)
		}
	})

	it("scharr produces a larger response than sobel on a diagonal edge", () => {
		const size = 16
		const input = diagonalEdge(size)
		const sobel = applyEdgeDetect(input, "sobel")
		const scharr = applyEdgeDetect(input, "scharr")

		const sobelMag = sobel.data[(8 * size + 8) * 4]!
		const scharrMag = scharr.data[(8 * size + 8) * 4]!
		expect(scharrMag).toBeGreaterThan(sobelMag)
	})

	it("preserves alpha", () => {
		const input = uniform(4, 4, 100, 128)
		const result = applyEdgeDetect(input, "sobel")
		for (let i = 3; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(128)
		}
	})
})
