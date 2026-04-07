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

describe("imageDataToRawImage", () => {
	it("converts ImageData dimensions and pixel data", async () => {
		const { imageDataToRawImage } = await import("./bridge")
		const pixels = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 128])
		const imageData = new ImageData(pixels, 2, 1)

		const raw = imageDataToRawImage(imageData)

		expect(raw.width).toBe(2)
		expect(raw.height).toBe(1)
		expect(raw.channels).toBe(4)
		expect(raw.data[0]).toBe(255)
		expect(raw.data[1]).toBe(0)
		expect(raw.data[2]).toBe(0)
		expect(raw.data[3]).toBe(255)
		expect(raw.data[4]).toBe(0)
		expect(raw.data[5]).toBe(255)
		expect(raw.data[6]).toBe(0)
		expect(raw.data[7]).toBe(128)
	})
})

describe("rawImageToImageData", () => {
	it("converts RawImage dimensions and pixel data", async () => {
		const { rawImageToImageData } = await import("./bridge")
		const data = new Uint8ClampedArray([100, 150, 200, 250])
		const raw = new MockRawImage(data, 1, 1, 4)

		const imageData = rawImageToImageData(raw as never)

		expect(imageData.width).toBe(1)
		expect(imageData.height).toBe(1)
		expect(imageData.data[0]).toBe(100)
		expect(imageData.data[1]).toBe(150)
		expect(imageData.data[2]).toBe(200)
		expect(imageData.data[3]).toBe(250)
	})
})

describe("round-trip", () => {
	it("preserves all pixel values through ImageData -> RawImage -> ImageData", async () => {
		const { imageDataToRawImage, rawImageToImageData } = await import("./bridge")
		const pixels = new Uint8ClampedArray([
			10, 20, 30, 40,
			50, 60, 70, 80,
			90, 100, 110, 120,
			130, 140, 150, 160,
		])
		const original = new ImageData(pixels, 2, 2)

		const raw = imageDataToRawImage(original)
		const result = rawImageToImageData(raw)

		expect(result.width).toBe(2)
		expect(result.height).toBe(2)
		expect(Array.from(result.data)).toEqual(Array.from(pixels))
	})

	it("preserves alpha values less than 255", async () => {
		const { imageDataToRawImage, rawImageToImageData } = await import("./bridge")
		const pixels = new Uint8ClampedArray([255, 128, 64, 0, 1, 2, 3, 127])
		const original = new ImageData(pixels, 2, 1)

		const raw = imageDataToRawImage(original)
		const result = rawImageToImageData(raw)

		expect(result.data[3]).toBe(0)
		expect(result.data[7]).toBe(127)
	})
})
