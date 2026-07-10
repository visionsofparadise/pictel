import { describe, it, expect, beforeAll } from "vitest"
import { padImageData } from "./pad-image-data"

beforeAll(() => {
	globalThis.ImageData = class ImageData {
		readonly data: Uint8ClampedArray
		readonly width: number
		readonly height: number

		constructor(widthOrData: number | Uint8ClampedArray, widthOrHeight: number, height?: number) {
			if (widthOrData instanceof Uint8ClampedArray) {
				this.data = widthOrData
				this.width = widthOrHeight
				this.height = height!
			} else {
				this.width = widthOrData
				this.height = widthOrHeight
				this.data = new Uint8ClampedArray(this.width * this.height * 4)
			}
		}
	} as unknown as typeof globalThis.ImageData
})

function makeImage(width: number, height: number, fill: number[]): ImageData {
	const data = new Uint8ClampedArray(width * height * 4)
	for (let i = 0; i < width * height; i++) {
		data[i * 4] = fill[0]!
		data[i * 4 + 1] = fill[1]!
		data[i * 4 + 2] = fill[2]!
		data[i * 4 + 3] = fill[3]!
	}
	return new ImageData(data, width, height)
}

describe("padImageData", () => {
	it("zero padding returns identical pixel data", () => {
		const input = makeImage(2, 2, [100, 150, 200, 255])
		const result = padImageData(input, 0, 0, 0, 0)
		expect(result.width).toBe(2)
		expect(result.height).toBe(2)
		expect(Array.from(result.data)).toEqual(Array.from(input.data))
	})

	it("uniform padding increases dimensions and centers pixels", () => {
		const input = makeImage(1, 1, [255, 128, 64, 255])
		const result = padImageData(input, 1, 1, 1, 1)

		expect(result.width).toBe(3)
		expect(result.height).toBe(3)

		const centerIndex = (1 * 3 + 1) * 4
		expect(result.data[centerIndex]).toBe(255)
		expect(result.data[centerIndex + 1]).toBe(128)
		expect(result.data[centerIndex + 2]).toBe(64)
		expect(result.data[centerIndex + 3]).toBe(255)

		const topLeftIndex = 0
		expect(result.data[topLeftIndex]).toBe(0)
		expect(result.data[topLeftIndex + 1]).toBe(0)
		expect(result.data[topLeftIndex + 2]).toBe(0)
		expect(result.data[topLeftIndex + 3]).toBe(0)

		const bottomRightIndex = (2 * 3 + 2) * 4
		expect(result.data[bottomRightIndex]).toBe(0)
		expect(result.data[bottomRightIndex + 3]).toBe(0)
	})

	it("asymmetric padding applies correct offsets", () => {
		const input = makeImage(1, 1, [10, 20, 30, 40])
		const result = padImageData(input, 2, 3, 1, 4)

		expect(result.width).toBe(1 + 4 + 3)
		expect(result.height).toBe(1 + 2 + 1)

		const pixelIndex = (2 * 8 + 4) * 4
		expect(result.data[pixelIndex]).toBe(10)
		expect(result.data[pixelIndex + 1]).toBe(20)
		expect(result.data[pixelIndex + 2]).toBe(30)
		expect(result.data[pixelIndex + 3]).toBe(40)

		const beforeIndex = (2 * 8 + 3) * 4
		expect(result.data[beforeIndex]).toBe(0)
		expect(result.data[beforeIndex + 3]).toBe(0)
	})

	it("does not mutate input ImageData", () => {
		const input = makeImage(2, 2, [100, 150, 200, 255])
		const originalData = new Uint8ClampedArray(input.data)
		padImageData(input, 1, 1, 1, 1)
		expect(input.data).toEqual(originalData)
	})
})
