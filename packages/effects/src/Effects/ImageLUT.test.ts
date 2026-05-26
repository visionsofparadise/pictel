import { beforeAll, describe, expect, it } from "vitest"
import { applyImageLut } from "./ImageLUT"

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

/**
 * Build an identity strip LUT of the given size.
 * Strip layout: size blocks side by side, each size x size pixels.
 * Total: (size * size) wide, size tall.
 * Blue selects block, X=red within block, Y=green.
 * Identity: output color = input color.
 */
function identityStripLut(size: number): ImageData {
	const width = size * size
	const height = size
	const data = new Uint8ClampedArray(width * height * 4)

	for (let b = 0; b < size; b++) {
		for (let g = 0; g < size; g++) {
			for (let r = 0; r < size; r++) {
				const x = b * size + r
				const y = g
				const idx = (y * width + x) * 4
				data[idx] = Math.round((r / (size - 1)) * 255)
				data[idx + 1] = Math.round((g / (size - 1)) * 255)
				data[idx + 2] = Math.round((b / (size - 1)) * 255)
				data[idx + 3] = 255
			}
		}
	}

	return new ImageData(data, width, height)
}

describe("applyImageLut", () => {
	it("identity LUT preserves pixel values", () => {
		const lut = identityStripLut(4)
		const input = pixel(100, 150, 200, 255)
		const result = applyImageLut(input, lut, 4)

		expect(result.data[0]).toBeCloseTo(100, 0)
		expect(result.data[1]).toBeCloseTo(150, 0)
		expect(result.data[2]).toBeCloseTo(200, 0)
	})

	it("known small LUT (size=2) maps correctly", () => {
		const width = 4
		const height = 2
		const data = new Uint8ClampedArray(width * height * 4)

		for (let b = 0; b < 2; b++) {
			for (let g = 0; g < 2; g++) {
				for (let r = 0; r < 2; r++) {
					const x = b * 2 + r
					const y = g
					const idx = (y * width + x) * 4
					data[idx] = b * 255
					data[idx + 1] = g * 255
					data[idx + 2] = r * 255
					data[idx + 3] = 255
				}
			}
		}

		const lut = new ImageData(data, width, height)
		const input = pixel(255, 0, 0, 255)
		const result = applyImageLut(input, lut, 2)

		expect(result.data[0]).toBeCloseTo(0, 0)
		expect(result.data[1]).toBeCloseTo(0, 0)
		expect(result.data[2]).toBeCloseTo(255, 0)
	})

	it("interpolates between blue slices", () => {
		const width = 4
		const height = 2
		const data = new Uint8ClampedArray(width * height * 4)

		for (let b = 0; b < 2; b++) {
			for (let g = 0; g < 2; g++) {
				for (let r = 0; r < 2; r++) {
					const x = b * 2 + r
					const y = g
					const idx = (y * width + x) * 4
					const val = b * 255
					data[idx] = val
					data[idx + 1] = val
					data[idx + 2] = val
					data[idx + 3] = 255
				}
			}
		}

		const lut = new ImageData(data, width, height)
		const input = pixel(0, 0, 128, 255)
		const result = applyImageLut(input, lut, 2)

		expect(result.data[0]).toBeCloseTo(128, 0)
		expect(result.data[1]).toBeCloseTo(128, 0)
		expect(result.data[2]).toBeCloseTo(128, 0)
	})

	it("preserves alpha", () => {
		const lut = identityStripLut(2)
		const result = applyImageLut(pixel(100, 100, 100, 42), lut, 2)
		expect(result.data[3]).toBe(42)
	})

	it("does not mutate input ImageData", () => {
		const lut = identityStripLut(2)
		const input = pixel(100, 150, 200, 255)
		const originalData = new Uint8ClampedArray(input.data)
		applyImageLut(input, lut, 2)
		expect(input.data).toEqual(originalData)
	})
})
