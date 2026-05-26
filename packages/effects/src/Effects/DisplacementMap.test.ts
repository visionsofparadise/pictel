import { describe, it, expect, beforeAll } from "vitest"
import { applyDisplacement } from "./DisplacementMap"

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

function makeImage(width: number, height: number, fill: (x: number, y: number) => [number, number, number, number]): ImageData {
	const data = new Uint8ClampedArray(width * height * 4)
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const [r, g, b, a] = fill(x, y)
			const idx = (y * width + x) * 4
			data[idx] = r
			data[idx + 1] = g
			data[idx + 2] = b
			data[idx + 3] = a
		}
	}
	return new ImageData(data, width, height)
}

function uniformMap(width: number, height: number, r: number, g: number): ImageData {
	return makeImage(width, height, () => [r, g, 0, 255])
}

describe("applyDisplacement", () => {
	it("returns identical output when map is all 128 (zero displacement)", () => {
		const source = makeImage(4, 4, (x, y) => [x * 60, y * 60, 100, 255])
		const map = uniformMap(4, 4, 128, 128)
		const result = applyDisplacement(source, map, 20, 20)

		expect(result.data).toEqual(source.data)
		expect(result.width).toBe(source.width)
		expect(result.height).toBe(source.height)
	})

	it("shifts pixels by scaleX/scaleY at maximum positive displacement", () => {
		const source = makeImage(10, 1, (x) => [x * 25, 0, 0, 255])
		const map = uniformMap(10, 1, 255, 128)
		const scale = 3
		const result = applyDisplacement(source, map, scale, 0)

		const expectedShift = Math.floor(((255 - 128) / 128) * scale)
		for (let x = 0; x < 10; x++) {
			const sampledX = Math.min(x + expectedShift, 9)
			expect(result.data[x * 4]).toBe(sampledX * 25)
		}
	})

	it("clamps out-of-bounds sampling to edge pixels", () => {
		const source = makeImage(4, 4, (x, y) => [x * 80, y * 80, 50, 200])
		const map = uniformMap(4, 4, 255, 255)
		const result = applyDisplacement(source, map, 100, 100)

		const cornerIdx = (3 * 4 + 3) * 4
		for (let i = 0; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(source.data[cornerIdx]!)
			expect(result.data[i + 1]).toBe(source.data[cornerIdx + 1]!)
			expect(result.data[i + 2]).toBe(source.data[cornerIdx + 2]!)
			expect(result.data[i + 3]).toBe(source.data[cornerIdx + 3]!)
		}
	})

	it("scales map coordinates proportionally when dimensions differ", () => {
		const source = makeImage(4, 4, (x) => [x * 60 + 10, 100, 100, 255])
		const map = uniformMap(2, 2, 128, 128)
		const result = applyDisplacement(source, map, 20, 20)

		expect(result.data).toEqual(source.data)
	})

	it("preserves alpha from the displaced source position", () => {
		const source = makeImage(4, 1, (x) => [100, 100, 100, x * 80])
		const map = uniformMap(4, 1, 255, 128)
		const result = applyDisplacement(source, map, 2, 0)

		expect(result.data[3]).toBe(80)
		expect(result.data[7]).toBe(160)
	})

	it("does not mutate input ImageData", () => {
		const source = makeImage(3, 3, (x, y) => [x * 80, y * 80, 50, 255])
		const map = uniformMap(3, 3, 200, 100)
		const originalSource = new Uint8ClampedArray(source.data)
		const originalMap = new Uint8ClampedArray(map.data)

		applyDisplacement(source, map, 10, 10)

		expect(source.data).toEqual(originalSource)
		expect(map.data).toEqual(originalMap)
	})
})
