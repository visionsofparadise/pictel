import { describe, it, expect, beforeAll } from "vitest"
import { applyBlurGpu } from "./applyBlurGpu"

// Vitest unit env is jsdom without WebGPU. Cross-validation against the CPU
// peer `applyUniformBlur` happens manually via the benchmark page
// (apps/demo/src/benchmark/entry.tsx, BlurGpu entry).

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
		data[offset] = 100
		data[offset + 1] = 150
		data[offset + 2] = 200
		data[offset + 3] = 255
	}

	return new ImageData(data, width, height)
}

describe("applyBlurGpu", () => {
	it("returns input unchanged for radius=0 without touching WebGPU", async () => {
		const input = uniformImage(8, 8)
		const result = await applyBlurGpu(input, 0)

		expect(result.pixels).toBe(input)
		expect(result.overflow).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
	})

	it("throws when WebGPU is unavailable", async () => {
		const input = uniformImage(8, 8)

		await expect(applyBlurGpu(input, 5)).rejects.toThrow(/WebGPU/)
	})
})
