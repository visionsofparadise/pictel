import { describe, it, expect, beforeAll } from "vitest"
import { applyOutlineGpu } from "./applyOutlineGpu"

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

describe("applyOutlineGpu", () => {
	it("throws when WebGPU is unavailable", async () => {
		const input = uniformImage(8, 8)

		await expect(applyOutlineGpu(input, 1, 1.6, 0, 200)).rejects.toThrow(/WebGPU/)
	})
})
