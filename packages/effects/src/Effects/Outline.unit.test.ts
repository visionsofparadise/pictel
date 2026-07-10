import { describe, it, expect, beforeAll } from "vitest"
import { applyOutline, applyMappedOutline } from "./Outline"

beforeAll(() => {
	globalThis.ImageData = class ImageData {
		readonly data: Uint8ClampedArray
		readonly width: number
		readonly height: number

		constructor(
			dataOrWidth: Uint8ClampedArray | number,
			widthOrHeight: number,
			height?: number,
		) {
			if (typeof dataOrWidth === "number") {
				this.width = dataOrWidth
				this.height = widthOrHeight
				this.data = new Uint8ClampedArray(this.width * this.height * 4)
			} else {
				this.data = dataOrWidth
				this.width = widthOrHeight
				this.height = height!
			}
		}
	} as unknown as typeof globalThis.ImageData
})

function solid(width: number, height: number, r: number, g: number, b: number, a: number): ImageData {
	const data = new Uint8ClampedArray(width * height * 4)

	for (let px = 0; px < data.length; px += 4) {
		data[px] = r
		data[px + 1] = g
		data[px + 2] = b
		data[px + 3] = a
	}

	return new ImageData(data, width, height)
}

function stepEdge(width: number, height: number, leftValue: number, rightValue: number): ImageData {
	const data = new Uint8ClampedArray(width * height * 4)
	const half = Math.floor(width / 2)

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const idx = (y * width + x) * 4
			const v = x < half ? leftValue : rightValue
			data[idx] = v
			data[idx + 1] = v
			data[idx + 2] = v
			data[idx + 3] = 255
		}
	}

	return new ImageData(data, width, height)
}

function countDarkPixels(image: ImageData, threshold: number): number {
	let count = 0

	for (let px = 0; px < image.data.length; px += 4) {
		if (image.data[px]! < threshold) count++
	}

	return count
}

function countIntermediatePixels(image: ImageData): number {
	let count = 0

	for (let px = 0; px < image.data.length; px += 4) {
		const value = image.data[px]!

		if (value > 8 && value < 247) count++
	}

	return count
}

describe("applyOutline", () => {
	it("solid uniform input of any luminance produces all-white output (no edges → no lines)", () => {
		for (const value of [0, 64, 128, 200, 255]) {
			const input = solid(16, 16, value, value, value, 255)
			const output = applyOutline(input, 1.0, 1.6, 0, 200)

			for (let px = 0; px < output.data.length; px += 4) {
				expect(output.data[px]).toBe(255)
				expect(output.data[px + 1]).toBe(255)
				expect(output.data[px + 2]).toBe(255)
			}
		}
	})

	it("sharp dark→light step edge draws a stroke on the dark side of the boundary", () => {
		const input = stepEdge(32, 32, 0, 255)
		const output = applyOutline(input, 1.0, 1.6, 0, 200)

		let edgeDark = 0
		let farDark = 0

		for (let y = 0; y < 32; y++) {
			for (let x = 11; x <= 15; x++) {
				if (output.data[(y * 32 + x) * 4]! < 128) edgeDark++
			}
			for (let x = 24; x <= 29; x++) {
				if (output.data[(y * 32 + x) * 4]! < 128) farDark++
			}
		}

		expect(edgeDark).toBeGreaterThan(0)
		expect(farDark).toBe(0)
	})

	it("larger sigma produces a thicker line response", () => {
		const input = stepEdge(64, 32, 0, 255)
		const thin = applyOutline(input, 0.5, 1.6, 0, 200)
		const thick = applyOutline(input, 2, 1.6, 0, 200)

		const thinDark = countDarkPixels(thin, 128)
		const thickDark = countDarkPixels(thick, 128)

		expect(thickDark).toBeGreaterThan(thinDark)
	})

	it("low phi produces more intermediate (softer) pixels than high phi", () => {
		const input = stepEdge(32, 32, 0, 255)
		const sharp = applyOutline(input, 2, 1.6, 0, 500)
		const soft = applyOutline(input, 2, 1.6, 0, 20)

		const sharpIntermediate = countIntermediatePixels(sharp)
		const softIntermediate = countIntermediatePixels(soft)

		expect(softIntermediate).toBeGreaterThan(sharpIntermediate)
	})

	it("preserves alpha channel from input", () => {
		const input = solid(8, 8, 200, 100, 50, 42)
		const output = applyOutline(input, 1.0, 1.6, 0, 200)

		for (let px = 3; px < output.data.length; px += 4) {
			expect(output.data[px]).toBe(42)
		}
	})
})

describe("applyMappedOutline", () => {
	it("black map preserves the original pixels", () => {
		const input = stepEdge(16, 16, 0, 255)
		const map = solid(16, 16, 0, 0, 0, 255)
		const output = applyMappedOutline(input, map, 1.0, 1.6, 0, 200)

		for (let i = 0; i < input.data.length; i++) {
			expect(output.data[i]).toBe(input.data[i])
		}
	})

	it("white map yields the fully outlined result", () => {
		const input = stepEdge(16, 16, 0, 255)
		const map = solid(16, 16, 255, 255, 255, 255)
		const outlined = applyOutline(input, 1.0, 1.6, 0, 200)
		const mapped = applyMappedOutline(input, map, 1.0, 1.6, 0, 200)

		for (let i = 0; i < outlined.data.length; i++) {
			expect(mapped.data[i]).toBe(outlined.data[i])
		}
	})
})
