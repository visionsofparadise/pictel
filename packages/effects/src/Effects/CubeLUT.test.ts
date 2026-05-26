import { beforeAll, describe, expect, it } from "vitest"
import { applyLut, parseCubeFile } from "./CubeLUT"

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

describe("parseCubeFile", () => {
	it("parses minimal size-2 cube file", () => {
		const cube = [
			"LUT_3D_SIZE 2",
			"0.0 0.0 0.0",
			"1.0 0.0 0.0",
			"0.0 1.0 0.0",
			"1.0 1.0 0.0",
			"0.0 0.0 1.0",
			"1.0 0.0 1.0",
			"0.0 1.0 1.0",
			"1.0 1.0 1.0",
		].join("\n")

		const result = parseCubeFile(cube)
		expect(result.size).toBe(2)
		expect(result.lut.length).toBe(2 * 2 * 2 * 3)
		// First entry: 0,0,0
		expect(result.lut[0]).toBe(0)
		expect(result.lut[1]).toBe(0)
		expect(result.lut[2]).toBe(0)
		// Second entry (r=1,g=0,b=0): 1,0,0
		expect(result.lut[3]).toBe(1)
		expect(result.lut[4]).toBe(0)
		expect(result.lut[5]).toBe(0)
	})

	it("handles comments and TITLE lines", () => {
		const cube = [
			"# This is a comment",
			"TITLE \"Test LUT\"",
			"DOMAIN_MIN 0.0 0.0 0.0",
			"DOMAIN_MAX 1.0 1.0 1.0",
			"LUT_3D_SIZE 2",
			"0.0 0.0 0.0",
			"1.0 0.0 0.0",
			"0.0 1.0 0.0",
			"1.0 1.0 0.0",
			"0.0 0.0 1.0",
			"1.0 0.0 1.0",
			"0.0 1.0 1.0",
			"1.0 1.0 1.0",
		].join("\n")

		const result = parseCubeFile(cube)
		expect(result.size).toBe(2)
		expect(result.lut.length).toBe(24)
	})

	it("throws on missing LUT_3D_SIZE", () => {
		expect(() => parseCubeFile("0.0 0.0 0.0")).toThrow("Missing LUT_3D_SIZE")
	})
})

describe("applyLut", () => {
	// Identity LUT size 2: corners map to themselves
	function identityLut2(): Float32Array {
		// R varies fastest, then G, then B
		// (r,g,b) for r,g,b in {0,1}
		const data = new Float32Array(2 * 2 * 2 * 3)
		for (let b = 0; b < 2; b++) {
			for (let g = 0; g < 2; g++) {
				for (let r = 0; r < 2; r++) {
					const idx = (b * 4 + g * 2 + r) * 3
					data[idx] = r
					data[idx + 1] = g
					data[idx + 2] = b
				}
			}
		}
		return data
	}

	it("identity LUT preserves pixel values", () => {
		const lut = identityLut2()
		const input = pixel(100, 150, 200, 255)
		const result = applyLut(input, lut, 2)

		expect(result.data[0]).toBeCloseTo(100, 0)
		expect(result.data[1]).toBeCloseTo(150, 0)
		expect(result.data[2]).toBeCloseTo(200, 0)
	})

	it("trilinear interpolation produces intermediate values", () => {
		// LUT that doubles red channel (clamped to 1.0)
		const lut = new Float32Array(2 * 2 * 2 * 3)
		for (let b = 0; b < 2; b++) {
			for (let g = 0; g < 2; g++) {
				for (let r = 0; r < 2; r++) {
					const idx = (b * 4 + g * 2 + r) * 3
					lut[idx] = Math.min(r * 2, 1) // red doubled
					lut[idx + 1] = g
					lut[idx + 2] = b
				}
			}
		}

		// Input with r=64 (0.251 normalized), which maps to coord 0.251
		// Interpolation between r=0 (output 0) and r=1 (output 1.0 clamped from 2)
		// Result: lerp(0, 1, 0.251) * 255 = ~64
		const input = pixel(64, 0, 0, 255)
		const result = applyLut(input, lut, 2)

		// At r=0 output is 0, at r=1 output is 1.0 (min(2,1))
		// So for r=64/255, coord = 64/255 * 1 = 0.251
		// lerp(0, 1, 0.251) = 0.251, * 255 = ~64
		expect(result.data[0]).toBeCloseTo(64, 0)
	})

	it("preserves alpha", () => {
		const lut = identityLut2()
		const result = applyLut(pixel(100, 100, 100, 42), lut, 2)
		expect(result.data[3]).toBe(42)
	})

	it("does not mutate input ImageData", () => {
		const lut = identityLut2()
		const input = pixel(100, 150, 200, 255)
		const originalData = new Uint8ClampedArray(input.data)
		applyLut(input, lut, 2)
		expect(input.data).toEqual(originalData)
	})
})
