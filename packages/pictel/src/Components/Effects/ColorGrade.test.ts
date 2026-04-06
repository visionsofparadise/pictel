import { describe, it, expect, beforeAll } from "vitest"
import { applyColorGrade } from "./ColorGrade"

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

describe("applyColorGrade", () => {
	it("brightness=2 doubles channel values (clamped to 255)", () => {
		const result = applyColorGrade(pixel(100, 50, 200, 255), { brightness: 2 })
		expect(result.data[0]).toBe(200)
		expect(result.data[1]).toBe(100)
		expect(result.data[2]).toBe(255) // 400 clamped
	})

	it("contrast=0 produces flat mid-gray", () => {
		const result = applyColorGrade(pixel(200, 100, 50, 255), { contrast: 0 })
		expect(result.data[0]).toBe(128)
		expect(result.data[1]).toBe(128)
		expect(result.data[2]).toBe(128)
	})

	it("saturation=0 produces grayscale matching BT.601", () => {
		const result = applyColorGrade(pixel(255, 0, 0, 255), { saturation: 0 })
		const expectedLum = Math.round(0.299 * 255)
		expect(result.data[0]).toBe(expectedLum)
		expect(result.data[1]).toBe(expectedLum)
		expect(result.data[2]).toBe(expectedLum)
	})

	it("positive temperature shifts warm (more red, less blue)", () => {
		const result = applyColorGrade(pixel(100, 100, 100, 255), { temperature: 1 })
		expect(result.data[0]).toBe(130) // +30
		expect(result.data[2]).toBe(70) // -30
	})

	it("positive tint shifts magenta (less green, more red)", () => {
		const result = applyColorGrade(pixel(100, 100, 100, 255), { tint: 1 })
		expect(result.data[0]).toBe(115) // +15
		expect(result.data[1]).toBe(70) // -30
	})

	it("no adjustments returns identical pixels", () => {
		const result = applyColorGrade(pixel(42, 128, 200, 180), {})
		expect(result.data[0]).toBe(42)
		expect(result.data[1]).toBe(128)
		expect(result.data[2]).toBe(200)
		expect(result.data[3]).toBe(180)
	})

	it("preserves alpha unchanged", () => {
		const result = applyColorGrade(pixel(100, 100, 100, 77), { brightness: 2, contrast: 0.5 })
		expect(result.data[3]).toBe(77)
	})
})
