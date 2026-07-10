import { describe, it, expect, beforeAll } from "vitest"
import { applyDirection, applyStructureField } from "./Direction"

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
	// Gradient points +x.
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
	// Gradient points +y.
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
			expect(result.data[i]).toBe(128)
			expect(result.data[i + 1]).toBe(128)
			expect(result.data[i + 2]).toBe(0)
		}
	})

	it("vertical edge -> gradient points right (cos~1, sin~0)", () => {
		const size = 16
		const input = verticalEdge(size)
		const result = applyDirection(input, "sobel")

		const px = (8 * size + 7) * 4
		const r = result.data[px]!
		const g = result.data[px + 1]!
		const b = result.data[px + 2]!

		expect(r).toBeGreaterThan(250)
		expect(g).toBeGreaterThanOrEqual(126)
		expect(g).toBeLessThanOrEqual(130)
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

		expect(r).toBeGreaterThanOrEqual(126)
		expect(r).toBeLessThanOrEqual(130)
		expect(g).toBeGreaterThan(250)
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

describe("applyStructureField", () => {
	it("uniform image emits the degenerate encoding at interior pixels", () => {
		const size = 16
		const input = uniform(size, size, 120)
		const result = applyStructureField(input, "sobel")

		for (let y = 2; y < size - 2; y++) {
			for (let x = 2; x < size - 2; x++) {
				const px = (y * size + x) * 4
				expect(result.data[px]).toBe(128)
				expect(result.data[px + 1]).toBe(128)
				expect(result.data[px + 2]).toBe(0)
			}
		}
	})

	it("vertical edge -> flow direction runs along the edge (vertical)", () => {
		const size = 24
		const input = verticalEdge(size)
		const result = applyStructureField(input, "sobel")

		const px = (12 * size + 12) * 4
		const r = result.data[px]!
		const g = result.data[px + 1]!

		expect(r).toBeGreaterThanOrEqual(123)
		expect(r).toBeLessThanOrEqual(133)
		expect(g < 8 || g > 247).toBe(true)
	})

	it("coherence is high near the edge and low in flat regions", () => {
		const size = 24
		const input = verticalEdge(size)
		const result = applyStructureField(input, "sobel")

		const edgePx = (12 * size + 12) * 4
		expect(result.data[edgePx + 2]).toBeGreaterThan(180)

		const flatPx = (12 * size + 3) * 4
		expect(result.data[flatPx + 2]).toBeLessThan(40)
	})

	it("preserves alpha", () => {
		const input = uniform(8, 8, 100, 128)
		const result = applyStructureField(input, "sobel")
		for (let i = 3; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(128)
		}
	})

	it("does not mutate input", () => {
		const input = verticalEdge(16)
		const original = new Uint8ClampedArray(input.data)
		applyStructureField(input, "sobel")
		expect(input.data).toEqual(original)
	})
})

function equiluminantHueEdge(size: number, alpha = 255): ImageData {
	const data = new Uint8ClampedArray(size * size * 4)
	const mid = size / 2
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4
			if (x < mid) {
				data[i] = 64
				data[i + 1] = 64
				data[i + 2] = 64
			} else {
				data[i] = 214
				data[i + 1] = 0
				data[i + 2] = 0
			}
			data[i + 3] = alpha
		}
	}
	return new ImageData(data, size, size)
}

function blackToRedVerticalEdge(size: number, alpha = 255): ImageData {
	// Vertical boundary: black on left, red on right. The channel-averaged
	// gradient ((gxR+gxG+gxB)/3) points along +X — gxR is strongly positive,
	// gxG and gxB are zero. Avoids the channel-cancellation case (e.g.
	// red→green) where R drops and G rises and the average is ~0.
	const data = new Uint8ClampedArray(size * size * 4)
	const mid = size / 2
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4
			if (x < mid) {
				data[i] = 0
				data[i + 1] = 0
				data[i + 2] = 0
			} else {
				data[i] = 255
				data[i + 1] = 0
				data[i + 2] = 0
			}
			data[i + 3] = alpha
		}
	}
	return new ImageData(data, size, size)
}

describe("applyDirection space=color", () => {
	it("space=luminance default matches the omitted-arg default", () => {
		const input = verticalEdge(16)
		const omitted = applyDirection(input, "sobel")
		const explicit = applyDirection(input, "sobel", "luminance")
		expect(explicit.data).toEqual(omitted.data)
	})

	it("on equiluminant hue boundary: luminance magnitude ≈ 0, color magnitude is strong", () => {
		const size = 16
		const input = equiluminantHueEdge(size)
		const lumResult = applyDirection(input, "sobel", "luminance")
		const colorResult = applyDirection(input, "sobel", "color")

		for (let y = 2; y < size - 2; y++) {
			const lumB = lumResult.data[(y * size + 7) * 4 + 2]!
			expect(lumB).toBeLessThanOrEqual(1)

			const colorB = colorResult.data[(y * size + 7) * 4 + 2]!
			expect(colorB).toBeGreaterThan(40)
		}
	})

	it("color direction on a black→red vertical boundary points along +X", () => {
		const size = 16
		const input = blackToRedVerticalEdge(size)
		const result = applyDirection(input, "sobel", "color")

		// Channel-averaged gx is gxR/3 here (G,B unchanged) but colour magnitude
		// is full |gxR|, so encoded cos = 1/3 rather than 1. Asserting half-plane.
		const px = (8 * size + 7) * 4
		const r = result.data[px]!
		const g = result.data[px + 1]!
		const b = result.data[px + 2]!

		expect(r).toBeGreaterThan(160)
		expect(g).toBeGreaterThanOrEqual(126)
		expect(g).toBeLessThanOrEqual(130)
		expect(b).toBeGreaterThan(0)
	})
})
