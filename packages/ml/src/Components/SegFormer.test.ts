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

		constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
			if (typeof dataOrWidth === "number") {
				this.width = dataOrWidth
				this.height = widthOrHeight
				this.data = new Uint8ClampedArray(dataOrWidth * widthOrHeight * 4)
			} else {
				this.data = dataOrWidth
				this.width = widthOrHeight
				this.height = height!
			}
		}
	} as unknown as typeof globalThis.ImageData
})

describe("segFormerSegment", () => {
	it("produces color-coded output from pipeline segments", async () => {
		const { segFormerSegment } = await import("./SegFormer")

		const mask0 = new MockRawImage(new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 0, 255]), 2, 1, 4)
		const mask1 = new MockRawImage(new Uint8ClampedArray([0, 0, 0, 255, 255, 0, 0, 255]), 2, 1, 4)

		const mockPipeline = vi.fn().mockResolvedValue([
			{ label: "wall", mask: mask0 },
			{ label: "floor", mask: mask1 },
		])

		const input = new ImageData(new Uint8ClampedArray(2 * 1 * 4), 2, 1)
		const result = await segFormerSegment(input, mockPipeline as never)

		expect(result.width).toBe(2)
		expect(result.height).toBe(1)

		expect(result.data[0]).toBe(230)
		expect(result.data[1]).toBe(25)
		expect(result.data[2]).toBe(75)
		expect(result.data[3]).toBe(255)

		expect(result.data[4]).toBe(60)
		expect(result.data[5]).toBe(180)
		expect(result.data[6]).toBe(75)
		expect(result.data[7]).toBe(255)
	})

	it("returns black image when pipeline returns no segments", async () => {
		const { segFormerSegment } = await import("./SegFormer")

		const mockPipeline = vi.fn().mockResolvedValue([])

		const input = new ImageData(new Uint8ClampedArray([255, 0, 0, 255]), 1, 1)
		const result = await segFormerSegment(input, mockPipeline as never)

		expect(result.width).toBe(1)
		expect(result.height).toBe(1)
		expect(result.data[0]).toBe(0)
		expect(result.data[1]).toBe(0)
		expect(result.data[2]).toBe(0)
		expect(result.data[3]).toBe(0)
	})

	it("does not mutate input ImageData", async () => {
		const { segFormerSegment } = await import("./SegFormer")

		const mask = new MockRawImage(new Uint8ClampedArray([255, 0, 0, 255]), 1, 1, 4)
		const mockPipeline = vi.fn().mockResolvedValue([
			{ label: "wall", mask },
		])

		const inputPixels = new Uint8ClampedArray([50, 100, 150, 200])
		const originalCopy = new Uint8ClampedArray(inputPixels)
		const input = new ImageData(inputPixels, 1, 1)

		await segFormerSegment(input, mockPipeline as never)

		expect(input.data).toEqual(originalCopy)
	})
})
