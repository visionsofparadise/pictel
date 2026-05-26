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
		// Size-2 LUT that swaps R and B channels
		const width = 4 // 2 blocks of 2 pixels
		const height = 2
		const data = new Uint8ClampedArray(width * height * 4)

		// Block 0 (b=0): output B=0
		// Block 1 (b=1): output B=255
		for (let b = 0; b < 2; b++) {
			for (let g = 0; g < 2; g++) {
				for (let r = 0; r < 2; r++) {
					const x = b * 2 + r
					const y = g
					const idx = (y * width + x) * 4
					// Swap: output R = input B, output G = input G, output B = input R
					data[idx] = b * 255     // output R = blue level
					data[idx + 1] = g * 255 // output G = green level
					data[idx + 2] = r * 255 // output B = red level
					data[idx + 3] = 255
				}
			}
		}

		const lut = new ImageData(data, width, height)
		const input = pixel(255, 0, 0, 255) // pure red
		const result = applyImageLut(input, lut, 2)

		// Pure red (255,0,0) -> swapped -> (0,0,255) pure blue
		expect(result.data[0]).toBeCloseTo(0, 0)
		expect(result.data[1]).toBeCloseTo(0, 0)
		expect(result.data[2]).toBeCloseTo(255, 0)
	})

	it("interpolates between blue slices", () => {
		// Size-2 LUT: block 0 outputs all black, block 1 outputs all white
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
		// Input with blue=128 -> between slices 0 and 1
		const input = pixel(0, 0, 128, 255)
		const result = applyImageLut(input, lut, 2)

		// Blue 128/255 * 1 = 0.502, frac between b0=0 (black) and b1=1 (white)
		// lerp(0, 255, 0.502) ≈ 128
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
