import { describe, it, expect, beforeAll } from "vitest"
import { applyHatch, applyHatchFieldAligned } from "./Hatch"

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
				this.height = height ?? 1
			}
		}
	} as unknown as typeof globalThis.ImageData
})

function makeImage(
	width: number,
	height: number,
	fill: (x: number, y: number) => [number, number, number, number],
): ImageData {
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

function horizontalGradient(width: number, height: number): ImageData {
	return makeImage(width, height, (x) => {
		const value = Math.round((x / (width - 1)) * 255)
		return [value, value, value, 255]
	})
}

function uniformField(width: number, height: number, r: number, g: number, b: number): ImageData {
	return makeImage(width, height, () => [r, g, b, 255])
}

function countBlackPixelsInRange(
	image: ImageData,
	xMin: number,
	xMax: number,
	yMin: number,
	yMax: number,
): number {
	let count = 0
	for (let y = yMin; y < yMax; y++) {
		for (let x = xMin; x < xMax; x++) {
			const idx = (y * image.width + x) * 4
			const r = image.data[idx] ?? 0
			const g = image.data[idx + 1] ?? 0
			const b = image.data[idx + 2] ?? 0
			if (r + g + b < 100) count++
		}
	}
	return count
}

function rowVariation(image: ImageData, y: number): number {
	const values: number[] = []
	for (let x = 0; x < image.width; x++) {
		values.push(image.data[(y * image.width + x) * 4] ?? 0)
	}
	const mean = values.reduce((s, v) => s + v, 0) / values.length
	return values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
}

function columnVariation(image: ImageData, x: number): number {
	const values: number[] = []
	for (let y = 0; y < image.height; y++) {
		values.push(image.data[(y * image.width + x) * 4] ?? 0)
	}
	const mean = values.reduce((s, v) => s + v, 0) / values.length
	return values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
}

describe("applyHatch (constant-angle)", () => {
	it("draws dense lines in dark regions and leaves the lightest tier white", () => {
		const input = horizontalGradient(256, 8)
		const result = applyHatch(input, 4, [0, 0, 0, 0], [8, 4, 4, 2])

		const darkBlack = countBlackPixelsInRange(result, 0, 43, 0, 8)
		const lightBlack = countBlackPixelsInRange(result, 213, 256, 0, 8)

		expect(darkBlack).toBeGreaterThan(20)
		expect(lightBlack).toBe(0)
	})

	it("respects per-band angle: angle=0 yields horizontal stripes, angle=π/2 yields vertical", () => {
		const dark = makeImage(64, 64, () => [40, 40, 40, 255])

		const horizontalStripes = applyHatch(dark, 4, [0, 0, 0, 0], [8, 8, 8, 8])
		const verticalStripes = applyHatch(dark, 4, [Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2], [8, 8, 8, 8])

		const hRowVar = rowVariation(horizontalStripes, 32)
		const hColVar = columnVariation(horizontalStripes, 32)
		const vRowVar = rowVariation(verticalStripes, 32)
		const vColVar = columnVariation(verticalStripes, 32)

		expect(hColVar).toBeGreaterThan(hRowVar)
		expect(vRowVar).toBeGreaterThan(vColVar)
	})

	it("preserves alpha", () => {
		const input = makeImage(16, 16, () => [128, 128, 128, 128])
		const result = applyHatch(input, 4, [0, 0, 0, 0], [4, 4, 4, 4])

		for (let i = 3; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(128)
		}
	})

	it("throws when angles length does not match bands", () => {
		const input = makeImage(16, 16, () => [100, 100, 100, 255])
		expect(() => applyHatch(input, 4, [0, 0, 0], [4, 4, 4, 4])).toThrow()
	})

	it("throws when spacing length does not match bands", () => {
		const input = makeImage(16, 16, () => [100, 100, 100, 255])
		expect(() => applyHatch(input, 4, [0, 0, 0, 0], [4, 4, 4])).toThrow()
	})
})

describe("applyHatchFieldAligned", () => {
	it("darkens dark-tier regions more than light-tier regions under a uniform field", () => {
		const input = makeImage(48, 24, (x) => {
			const value = x < 24 ? 0 : 255
			return [value, value, value, 255]
		})
		const field = uniformField(48, 24, 255, 128, 255)
		const result = applyHatchFieldAligned(input, field, 4, [4, 4, 4, 4], 8, 1.0)

		let leftSum = 0
		let rightSum = 0
		let leftCount = 0
		let rightCount = 0
		for (let y = 0; y < 24; y++) {
			for (let x = 0; x < 48; x++) {
				const idx = (y * 48 + x) * 4
				const value = result.data[idx] ?? 0
				if (x < 24) {
					leftSum += value
					leftCount++
				} else {
					rightSum += value
					rightCount++
				}
			}
		}
		const leftMean = leftSum / leftCount
		const rightMean = rightSum / rightCount

		expect(rightMean).toBe(255)
		expect(leftMean).toBeLessThan(rightMean - 20)
	})

	it("bands by tier: tighter-spacing tiers are darker than looser-spacing tiers", () => {
		const width = 64
		const height = 24
		const input = makeImage(width, height, (x) => {
			const quarter = Math.min(3, Math.floor((x / width) * 4))
			const value = Math.round((255 * quarter) / 3)
			return [value, value, value, 255]
		})
		const field = uniformField(width, height, 255, 128, 255)
		const result = applyHatchFieldAligned(input, field, 4, [4, 6, 10, 14], 10, 1.0)

		const quarterMean = (q: number): number => {
			let sum = 0
			let count = 0
			for (let y = 0; y < height; y++) {
				for (let x = q * 16; x < (q + 1) * 16; x++) {
					sum += result.data[(y * width + x) * 4] ?? 0
					count++
				}
			}
			return sum / count
		}

		const deepest = quarterMean(0)
		const mid = quarterMean(1)
		const lighter = quarterMean(2)
		const lightest = quarterMean(3)

		expect(deepest).toBeLessThan(mid)
		expect(mid).toBeLessThan(lighter)
		expect(lightest).toBe(255)
	})

	it("is deterministic given the same inputs", () => {
		const input = makeImage(40, 20, (x) => {
			const value = x < 20 ? 0 : 128
			return [value, value, value, 255]
		})
		const field = uniformField(40, 20, 255, 128, 255)
		const a = applyHatchFieldAligned(input, field, 4, [4, 6, 8, 10], 8, 1.0)
		const b = applyHatchFieldAligned(input, field, 4, [4, 6, 8, 10], 8, 1.0)

		expect(Array.from(a.data)).toEqual(Array.from(b.data))
	})

	it("produces line texture in every orientation under a vertical field", () => {
		const input = makeImage(32, 32, () => [0, 0, 0, 255])
		const field = uniformField(32, 32, 128, 255, 255)
		const result = applyHatchFieldAligned(input, field, 4, [5, 5, 5, 5], 10, 1.0)

		const values = new Set<number>()
		for (let i = 0; i < result.data.length; i += 4) {
			values.add(result.data[i] ?? 0)
		}
		expect(values.size).toBeGreaterThan(1)
	})

	it("does not mutate its input", () => {
		const input = makeImage(24, 24, (x) => {
			const value = x < 12 ? 20 : 200
			return [value, value, value, 255]
		})
		const snapshot = Array.from(input.data)
		const field = uniformField(24, 24, 255, 128, 255)
		applyHatchFieldAligned(input, field, 4, [4, 6, 8, 10], 6, 1.0)

		expect(Array.from(input.data)).toEqual(snapshot)
	})

	it("throws when field dimensions do not match pixels", () => {
		const input = makeImage(32, 32, () => [128, 128, 128, 255])
		const field = uniformField(16, 16, 255, 128, 255)
		expect(() => applyHatchFieldAligned(input, field, 4, [8, 4, 4, 2], 10, 1.0)).toThrow()
	})

	it("throws when spacing length does not match bands", () => {
		const input = makeImage(16, 16, () => [128, 128, 128, 255])
		const field = uniformField(16, 16, 255, 128, 255)
		expect(() => applyHatchFieldAligned(input, field, 4, [8, 4, 4], 10, 1.0)).toThrow()
	})

	it("preserves alpha", () => {
		const input = makeImage(16, 16, () => [80, 80, 80, 200])
		const field = uniformField(16, 16, 255, 128, 255)
		const result = applyHatchFieldAligned(input, field, 4, [4, 4, 4, 4], 5, 1.0)

		for (let i = 3; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(200)
		}
	})
})
