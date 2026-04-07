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

describe("estimateDepth", () => {
	it("converts depth pipeline output to grayscale RGBA ImageData", async () => {
		const { estimateDepth } = await import("./DepthMap")

		const input = new ImageData(new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 128]), 2, 1)

		const depthValues = new Uint8ClampedArray([100, 200])
		const depthImage = new MockRawImage(depthValues, 2, 1, 1)

		const mockPipeline = vi.fn().mockResolvedValue({ depth: depthImage })

		const result = await estimateDepth(input, mockPipeline as never)

		expect(result.width).toBe(2)
		expect(result.height).toBe(1)
		// Pixel 1: depth=100, should be R=G=B=100, A=255
		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(100)
		expect(result.data[2]).toBe(100)
		expect(result.data[3]).toBe(255)
		// Pixel 2: depth=200, should be R=G=B=200, A=255
		expect(result.data[4]).toBe(200)
		expect(result.data[5]).toBe(200)
		expect(result.data[6]).toBe(200)
		expect(result.data[7]).toBe(255)
	})

	it("passes RawImage to the pipeline", async () => {
		const { estimateDepth } = await import("./DepthMap")

		const input = new ImageData(new Uint8ClampedArray([10, 20, 30, 40]), 1, 1)
		const depthImage = new MockRawImage(new Uint8ClampedArray([128]), 1, 1, 1)
		const mockPipeline = vi.fn().mockResolvedValue({ depth: depthImage })

		await estimateDepth(input, mockPipeline as never)

		expect(mockPipeline).toHaveBeenCalledOnce()
		const arg = mockPipeline.mock.calls[0]![0]
		expect(arg.width).toBe(1)
		expect(arg.height).toBe(1)
		expect(arg.channels).toBe(4)
	})

	it("does not mutate input ImageData", async () => {
		const { estimateDepth } = await import("./DepthMap")

		const inputData = new Uint8ClampedArray([50, 100, 150, 200])
		const input = new ImageData(new Uint8ClampedArray(inputData), 1, 1)
		const originalData = new Uint8ClampedArray(input.data)

		const depthImage = new MockRawImage(new Uint8ClampedArray([64]), 1, 1, 1)
		const mockPipeline = vi.fn().mockResolvedValue({ depth: depthImage })

		await estimateDepth(input, mockPipeline as never)

		expect(input.data).toEqual(originalData)
	})
})
