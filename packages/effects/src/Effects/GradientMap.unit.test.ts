import { describe, it, expect, beforeAll } from "vitest"
import { applyGradientMap, buildGradientLut } from "./GradientMap"

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

function rampLut(
	dark: [number, number, number],
	light: [number, number, number],
): Uint8ClampedArray {
	const lut = new Uint8ClampedArray(256 * 4)

	for (let i = 0; i < 256; i += 1) {
		const t = i / 255
		const out = i * 4
		lut[out] = dark[0] + t * (light[0] - dark[0])
		lut[out + 1] = dark[1] + t * (light[1] - dark[1])
		lut[out + 2] = dark[2] + t * (light[2] - dark[2])
		lut[out + 3] = 255
	}

	return lut
}

describe("applyGradientMap", () => {
	const dark: [number, number, number] = [20, 40, 60]
	const light: [number, number, number] = [220, 200, 180]
	const lut = rampLut(dark, light)

	it("maps pure black to the first ramp entry", () => {
		const result = applyGradientMap(pixel(0, 0, 0, 255), lut)
		expect(result.data[0]).toBe(20)
		expect(result.data[1]).toBe(40)
		expect(result.data[2]).toBe(60)
	})

	it("maps pure white to the last ramp entry", () => {
		const result = applyGradientMap(pixel(255, 255, 255, 255), lut)
		expect(result.data[0]).toBe(220)
		expect(result.data[1]).toBe(200)
		expect(result.data[2]).toBe(180)
	})

	it("maps mid-gray to the interpolated mid-ramp color", () => {
		const result = applyGradientMap(pixel(128, 128, 128, 255), lut)
		const t = 128 / 255
		expect(result.data[0]).toBeCloseTo(20 + t * (220 - 20), 0)
		expect(result.data[1]).toBeCloseTo(40 + t * (200 - 40), 0)
		expect(result.data[2]).toBeCloseTo(60 + t * (180 - 60), 0)
	})

	it("preserves alpha", () => {
		const result = applyGradientMap(pixel(100, 100, 100, 42), lut)
		expect(result.data[3]).toBe(42)
	})

	it("does not mutate input ImageData", () => {
		const input = pixel(100, 150, 200, 255)
		const originalData = new Uint8ClampedArray(input.data)
		applyGradientMap(input, lut)
		expect(input.data).toEqual(originalData)
	})
})

describe("buildGradientLut", () => {
	it("clamps below the first stop and above the last", () => {
		const lut = buildGradientLut([
			{ color: "#101010", position: 0.25 },
			{ color: "#f0f0f0", position: 0.75 },
		])

		// Index 0 (luminance 0) is below the first stop at 0.25 → first color.
		expect(lut[0]).toBe(0x10)
		// Index 255 (luminance 255 → t=1) is above the last stop at 0.75 → last color.
		expect(lut[255 * 4]).toBe(0xf0)
	})

	it("interpolates the middle band of a 3-stop ramp", () => {
		const lut = buildGradientLut([
			{ color: "rgb(0, 0, 0)", position: 0 },
			{ color: "rgb(255, 0, 0)", position: 0.5 },
			{ color: "rgb(255, 255, 255)", position: 1 },
		])

		// t = 0.25 sits halfway between stop0 (black) and stop1 (red): R ≈ 128, G ≈ 0.
		const index = Math.round(0.25 * 255) * 4
		expect(lut[index]).toBeCloseTo(128, -1)
		expect(lut[index + 1]).toBe(0)
		expect(lut[index + 2]).toBe(0)

		// t = 0.75 sits halfway between stop1 (red) and stop2 (white): G ≈ 128, B ≈ 128.
		const upperIndex = Math.round(0.75 * 255) * 4
		expect(upperIndex === index).toBe(false)
		expect(lut[upperIndex]).toBe(255)
		expect(lut[upperIndex + 1]).toBeCloseTo(128, -1)
		expect(lut[upperIndex + 2]).toBeCloseTo(128, -1)
	})
})
