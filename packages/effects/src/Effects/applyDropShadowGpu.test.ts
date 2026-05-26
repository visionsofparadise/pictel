import { describe, it, expect, beforeAll } from "vitest"
import { applyDropShadowGpu } from "./applyDropShadowGpu"

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

describe("applyDropShadowGpu", () => {
	it("throws when WebGPU is unavailable", async () => {
		const input = uniformImage(8, 8)

		await expect(
			applyDropShadowGpu(input, 0, 0, 5, "rgba(0,0,0,1)"),
		).rejects.toThrow(/WebGPU/)
	})
})
