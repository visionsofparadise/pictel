import { describe, it, expect, beforeAll } from "vitest"
import { applyShockFilterGpu } from "./applyShockFilterGpu"

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

function uniformImage(width: number, height: number): ImageData {
	const data = new Uint8ClampedArray(width * height * 4)

	for (let offset = 0; offset < data.length; offset += 4) {
		data[offset] = 128
		data[offset + 1] = 128
		data[offset + 2] = 128
		data[offset + 3] = 255
	}

	return new ImageData(data, width, height)
}

describe("applyShockFilterGpu", () => {
	it("returns input unchanged for iterations=0 without touching WebGPU", async () => {
		const input = uniformImage(4, 4)
		const result = await applyShockFilterGpu(input, 0, 1)

		expect(result.width).toBe(4)
		expect(result.height).toBe(4)
		// Output is a copy of the input bytes — same values, new buffer.
		expect(Array.from(result.data)).toEqual(Array.from(input.data))
	})

	it("throws when WebGPU is unavailable", async () => {
		const input = uniformImage(8, 8)

		await expect(applyShockFilterGpu(input, 4, 1)).rejects.toThrow(/WebGPU/)
	})
})
