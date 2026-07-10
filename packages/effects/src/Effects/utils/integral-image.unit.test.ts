/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { describe, it, expect, beforeAll } from "vitest"
import { buildIntegralImage, integralChannelSum } from "./integral-image"

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

describe("buildIntegralImage", () => {
	it("4-pixel image with known channel values yields correct cumulative sums", () => {
		// 2×2 image. Pixels:
		//   (0,0) = R=10  G=20  B=30  A=255
		//   (1,0) = R=40  G=50  B=60  A=255
		//   (0,1) = R=70  G=80  B=90  A=255
		//   (1,1) = R=100 G=110 B=120 A=255
		const data = new Uint8ClampedArray([
			10, 20, 30, 255,
			40, 50, 60, 255,
			70, 80, 90, 255,
			100, 110, 120, 255,
		])
		const image = new ImageData(data, 2, 2)

		const integral = buildIntegralImage(image)

		expect(integral.width).toBe(2)
		expect(integral.height).toBe(2)
		expect(integral.stride).toBe(3) // width + 1

		// Sum over full image (whole rectangle).
		expect(integralChannelSum(integral, 0, 0, 2, 2, 0)).toBe(10 + 40 + 70 + 100) // R = 220
		expect(integralChannelSum(integral, 0, 0, 2, 2, 1)).toBe(20 + 50 + 80 + 110) // G = 260
		expect(integralChannelSum(integral, 0, 0, 2, 2, 2)).toBe(30 + 60 + 90 + 120) // B = 300
		expect(integralChannelSum(integral, 0, 0, 2, 2, 3)).toBe(255 * 4) // A = 1020

		// Sum over the top-left pixel only.
		expect(integralChannelSum(integral, 0, 0, 1, 1, 0)).toBe(10)
		expect(integralChannelSum(integral, 0, 0, 1, 1, 1)).toBe(20)

		// Sum over the bottom-right pixel only.
		expect(integralChannelSum(integral, 1, 1, 2, 2, 0)).toBe(100)
		expect(integralChannelSum(integral, 1, 1, 2, 2, 2)).toBe(120)

		// Sum over the top row.
		expect(integralChannelSum(integral, 0, 0, 2, 1, 0)).toBe(10 + 40) // 50
		expect(integralChannelSum(integral, 0, 0, 2, 1, 1)).toBe(20 + 50) // 70

		// Sum over the right column.
		expect(integralChannelSum(integral, 1, 0, 2, 2, 0)).toBe(40 + 100) // 140
		expect(integralChannelSum(integral, 1, 0, 2, 2, 2)).toBe(60 + 120) // 180
	})

	it("leading row and column of the table are zero (so unclamped corners are safe)", () => {
		const data = new Uint8ClampedArray([
			1, 2, 3, 4,
			5, 6, 7, 8,
		])
		const image = new ImageData(data, 2, 1)
		const { sums, stride } = buildIntegralImage(image)

		// First row (y=0) is all zero.
		for (let x = 0; x <= 2; x++) {
			for (let c = 0; c < 4; c++) {
				expect(sums[x * 4 + c]).toBe(0)
			}
		}

		// First column (x=0) is all zero for each row.
		for (let y = 0; y <= 1; y++) {
			for (let c = 0; c < 4; c++) {
				expect(sums[y * stride * 4 + c]).toBe(0)
			}
		}
	})

	it("matches the brute-force sum on a small mixed image", () => {
		const width = 5
		const height = 4
		const data = new Uint8ClampedArray(width * height * 4)

		for (let i = 0; i < width * height; i++) {
			data[i * 4] = (i * 13) & 0xff
			data[i * 4 + 1] = (i * 27) & 0xff
			data[i * 4 + 2] = (i * 41) & 0xff
			data[i * 4 + 3] = 255
		}

		const image = new ImageData(data, width, height)
		const integral = buildIntegralImage(image)

		// Random rectangles, compare with the trivial loop.
		const rects: Array<[number, number, number, number]> = [
			[0, 0, 5, 4],
			[1, 1, 4, 3],
			[2, 0, 5, 4],
			[0, 2, 3, 4],
			[2, 1, 3, 2],
		]

		for (const [x1, y1, x2, y2] of rects) {
			for (let c = 0; c < 4; c++) {
				let expected = 0

				for (let y = y1; y < y2; y++) {
					for (let x = x1; x < x2; x++) {
						expected += data[(y * width + x) * 4 + c]!
					}
				}

				expect(integralChannelSum(integral, x1, y1, x2, y2, c)).toBe(expected)
			}
		}
	})

	it("clamps out-of-range coordinates to image bounds", () => {
		const data = new Uint8ClampedArray([
			10, 20, 30, 255,
			40, 50, 60, 255,
			70, 80, 90, 255,
			100, 110, 120, 255,
		])
		const integral = buildIntegralImage(new ImageData(data, 2, 2))

		// Asking for `[-5, -5)..[10, 10)` should clamp to `[0, 0)..[2, 2)`.
		expect(integralChannelSum(integral, -5, -5, 10, 10, 0)).toBe(220)
	})
})
