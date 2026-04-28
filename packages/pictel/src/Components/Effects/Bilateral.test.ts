import { describe, it, expect, beforeAll } from "vitest"
import { applyBilateral } from "./Bilateral"

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

function uniformImage(
	width: number,
	height: number,
	r: number,
	g: number,
	b: number,
	a: number,
): ImageData {
	const data = new Uint8ClampedArray(width * height * 4)
	for (let i = 0; i < data.length; i += 4) {
		data[i] = r
		data[i + 1] = g
		data[i + 2] = b
		data[i + 3] = a
	}
	return new ImageData(data, width, height)
}

function noisyUniformImage(
	width: number,
	height: number,
	mean: number,
	noise: number,
	alpha: number,
): ImageData {
	// Deterministic pseudo-random offset in [-noise, +noise]
	const data = new Uint8ClampedArray(width * height * 4)
	let seed = 1
	const next = () => {
		// LCG — deterministic across runs
		seed = (seed * 1103515245 + 12345) & 0x7fffffff
		return seed / 0x7fffffff
	}
	for (let i = 0; i < data.length; i += 4) {
		const offset = Math.round((next() * 2 - 1) * noise)
		const v = Math.max(0, Math.min(255, mean + offset))
		data[i] = v
		data[i + 1] = v
		data[i + 2] = v
		data[i + 3] = alpha
	}
	return new ImageData(data, width, height)
}

function halfSplitImage(
	width: number,
	height: number,
	leftValue: number,
	rightValue: number,
	alpha: number,
): ImageData {
	const data = new Uint8ClampedArray(width * height * 4)
	const half = Math.floor(width / 2)
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const idx = (y * width + x) * 4
			const v = x < half ? leftValue : rightValue
			data[idx] = v
			data[idx + 1] = v
			data[idx + 2] = v
			data[idx + 3] = alpha
		}
	}
	return new ImageData(data, width, height)
}

describe("applyBilateral", () => {
	it("identity-ish at small sigma on uniform input", () => {
		const input = uniformImage(8, 8, 120, 120, 120, 255)
		const result = applyBilateral(input, 0.5, 10)
		// Uniform input + any sigma = uniform output (within rounding).
		for (let i = 0; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(120)
			expect(result.data[i + 1]).toBe(120)
			expect(result.data[i + 2]).toBe(120)
		}
	})

	it("smooths noise within a flat region toward the mean", () => {
		const input = noisyUniformImage(32, 32, 128, 5, 255)
		const result = applyBilateral(input, 3, 50)
		// Inspect the interior (avoid boundary pixels that have asymmetric neighborhoods)
		for (let y = 4; y < 28; y++) {
			for (let x = 4; x < 28; x++) {
				const idx = (y * 32 + x) * 4
				expect(Math.abs(result.data[idx]! - 128)).toBeLessThanOrEqual(2)
			}
		}
	})

	it("preserves a hard edge — does not bridge across with low colorSigma", () => {
		const input = halfSplitImage(32, 16, 0, 255, 255)
		const result = applyBilateral(input, 3, 20)

		// Far-from-edge pixels should be ~unchanged
		const farLeftIdx = (8 * 32 + 2) * 4
		const farRightIdx = (8 * 32 + 29) * 4
		expect(result.data[farLeftIdx]!).toBeLessThanOrEqual(5)
		expect(result.data[farRightIdx]!).toBeGreaterThanOrEqual(250)

		// Pixels right next to the edge should NOT have averaged across (no gray ramp)
		const leftEdgeIdx = (8 * 32 + 15) * 4
		const rightEdgeIdx = (8 * 32 + 16) * 4
		// A naive Gaussian blur at sigma=3 would push these toward 127.
		// Bilateral with colorSigma=20 should keep them well separated.
		expect(result.data[leftEdgeIdx]!).toBeLessThan(40)
		expect(result.data[rightEdgeIdx]!).toBeGreaterThan(215)
	})

	it("colorSigma controls bridging — large colorSigma degenerates toward Gaussian", () => {
		const input = halfSplitImage(32, 16, 0, 255, 255)
		const lowColor = applyBilateral(input, 3, 20)
		const highColor = applyBilateral(input, 3, 300)

		// With a huge colorSigma, the color weight ≈ 1 everywhere → behaves like a Gaussian blur.
		// Edge pixels should be pulled meaningfully toward the middle compared to low-colorSigma.
		const leftEdgeIdx = (8 * 32 + 15) * 4
		const rightEdgeIdx = (8 * 32 + 16) * 4

		// Bridging happened: high-colorSigma pulls left up and right down vs. low-colorSigma.
		expect(highColor.data[leftEdgeIdx]!).toBeGreaterThan(lowColor.data[leftEdgeIdx]! + 30)
		expect(highColor.data[rightEdgeIdx]!).toBeLessThan(lowColor.data[rightEdgeIdx]! - 30)
	})

	it("preserves alpha unchanged", () => {
		const input = uniformImage(4, 4, 100, 100, 100, 128)
		const result = applyBilateral(input, 1, 25)
		for (let i = 3; i < result.data.length; i += 4) {
			expect(result.data[i]).toBe(128)
		}
	})
})
