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

describe("upscale", () => {
	it("returns output at 2x dimensions from pipeline result", async () => {
		const { upscale } = await import("./Upscale")

		const inputPixels = new Uint8ClampedArray([255, 0, 0, 255])
		const input = new ImageData(inputPixels, 1, 1)

		// Mock pipeline returns a 2x2 image (2x the 1x1 input)
		const upscaledData = new Uint8ClampedArray([
			255, 0, 0, 255,
			255, 0, 0, 255,
			255, 0, 0, 255,
			255, 0, 0, 255,
		])
		const mockPipeline = vi.fn().mockResolvedValue(
			new MockRawImage(upscaledData, 2, 2, 4),
		)

		const result = await upscale(input, mockPipeline as never)

		expect(result.width).toBe(2)
		expect(result.height).toBe(2)
		expect(result.width).toBeGreaterThan(input.width)
		expect(result.height).toBeGreaterThan(input.height)
	})

	it("preserves pixel values from pipeline output", async () => {
		const { upscale } = await import("./Upscale")

		const input = new ImageData(new Uint8ClampedArray([10, 20, 30, 40]), 1, 1)

		const upscaledData = new Uint8ClampedArray([
			100, 150, 200, 250,
			110, 160, 210, 240,
			120, 170, 220, 230,
			130, 180, 230, 220,
		])
		const mockPipeline = vi.fn().mockResolvedValue(
			new MockRawImage(upscaledData, 2, 2, 4),
		)

		const result = await upscale(input, mockPipeline as never)

		expect(result.data[0]).toBe(100)
		expect(result.data[1]).toBe(150)
		expect(result.data[2]).toBe(200)
		expect(result.data[3]).toBe(250)
		expect(result.data[4]).toBe(110)
		expect(result.data[5]).toBe(160)
	})

	it("passes input as RawImage to the pipeline", async () => {
		const { upscale } = await import("./Upscale")

		const input = new ImageData(new Uint8ClampedArray([50, 60, 70, 80]), 1, 1)

		const mockPipeline = vi.fn().mockResolvedValue(
			new MockRawImage(new Uint8ClampedArray([50, 60, 70, 80, 50, 60, 70, 80, 50, 60, 70, 80, 50, 60, 70, 80]), 2, 2, 4),
		)

		await upscale(input, mockPipeline as never)

		expect(mockPipeline).toHaveBeenCalledOnce()
		const arg = mockPipeline.mock.calls[0]![0]
		expect(arg.width).toBe(1)
		expect(arg.height).toBe(1)
		expect(arg.channels).toBe(4)
	})
})
