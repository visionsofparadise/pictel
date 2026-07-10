import { describe, it, expect, beforeAll } from "vitest"
import { applyGrain } from "./Grain"

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

function gray4x4(value: number): ImageData {
	const data = new Uint8ClampedArray(16 * 4)
	for (let i = 0; i < 16; i++) {
		data[i * 4] = value
		data[i * 4 + 1] = value
		data[i * 4 + 2] = value
		data[i * 4 + 3] = 255
	}
	return new ImageData(data, 4, 4)
}

describe("applyGrain", () => {
	it("is deterministic: same seed produces same output", () => {
		const input = gray4x4(128)
		const a = applyGrain(input, 50, 42)
		const b = applyGrain(input, 50, 42)
		expect(Array.from(a.data)).toEqual(Array.from(b.data))
	})

	it("different seeds produce different output", () => {
		const input = gray4x4(128)
		const a = applyGrain(input, 50, 1)
		const b = applyGrain(input, 50, 2)
		expect(Array.from(a.data)).not.toEqual(Array.from(b.data))
	})

	it("intensity=0 returns identical output", () => {
		const input = gray4x4(128)
		const result = applyGrain(input, 0, 42)
		expect(Array.from(result.data)).toEqual(Array.from(input.data))
	})

	it("preserves alpha", () => {
		const input = pixel(100, 150, 200, 42)
		const result = applyGrain(input, 50, 99)
		expect(result.data[3]).toBe(42)
	})

	it("does not mutate input", () => {
		const input = pixel(100, 150, 200, 255)
		const original = new Uint8ClampedArray(input.data)
		applyGrain(input, 50, 42)
		expect(input.data).toEqual(original)
	})
})
