import { describe, it, expect, beforeAll, vi } from "vitest"

class MockRawImage {
	readonly data: Uint8ClampedArray | Uint8Array
	readonly width: number
	readonly height: number
	readonly channels: 1 | 2 | 3 | 4

	constructor(data: Uint8ClampedArray | Uint8Array, width: number, height: number, channels: 1 | 2 | 3 | 4) {
		this.data = data
		this.width = width
		this.height = height
		this.channels = channels
	}

	rgba(): MockRawImage {
		if (this.channels === 4) return this

		const pixels = this.width * this.height
		const out = new Uint8ClampedArray(pixels * 4)

		for (let i = 0; i < pixels; i++) {
			if (this.channels === 1) {
				out[i * 4] = this.data[i]!
				out[i * 4 + 1] = this.data[i]!
				out[i * 4 + 2] = this.data[i]!
				out[i * 4 + 3] = 255
			} else if (this.channels === 3) {
				out[i * 4] = this.data[i * 3]!
				out[i * 4 + 1] = this.data[i * 3 + 1]!
				out[i * 4 + 2] = this.data[i * 3 + 2]!
				out[i * 4 + 3] = 255
			}
		}

		return new MockRawImage(out, this.width, this.height, 4)
	}
}

vi.mock("@huggingface/transformers", () => ({
	RawImage: MockRawImage,
}))

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

describe("removeBackground", () => {
	it("converts input through pipeline and returns result as ImageData", async () => {
		const { removeBackground } = await import("./RemoveBackground")

		const outputPixels = new Uint8ClampedArray([10, 20, 30, 128])
		const mockPipeline = vi.fn().mockResolvedValue(
			new MockRawImage(outputPixels, 1, 1, 4),
		)

		const input = new ImageData(new Uint8ClampedArray([255, 0, 0, 255]), 1, 1)
		const result = await removeBackground(input, mockPipeline as never)

		expect(result.width).toBe(1)
		expect(result.height).toBe(1)
		expect(result.data[0]).toBe(10)
		expect(result.data[1]).toBe(20)
		expect(result.data[2]).toBe(30)
		expect(result.data[3]).toBe(128)
		expect(mockPipeline).toHaveBeenCalledOnce()
	})

	it("preserves alpha from model output", async () => {
		const { removeBackground } = await import("./RemoveBackground")

		const mockPipeline = vi.fn().mockResolvedValue(
			new MockRawImage(new Uint8ClampedArray([100, 150, 200, 0]), 1, 1, 4),
		)

		const input = new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1)
		const result = await removeBackground(input, mockPipeline as never)

		expect(result.data[3]).toBe(0)
	})

	it("does not mutate input ImageData", async () => {
		const { removeBackground } = await import("./RemoveBackground")

		const inputPixels = new Uint8ClampedArray([50, 100, 150, 200])
		const originalCopy = new Uint8ClampedArray(inputPixels)
		const input = new ImageData(inputPixels, 1, 1)

		const mockPipeline = vi.fn().mockResolvedValue(
			new MockRawImage(new Uint8ClampedArray([10, 20, 30, 40]), 1, 1, 4),
		)

		await removeBackground(input, mockPipeline as never)

		expect(input.data).toEqual(originalCopy)
	})
})
