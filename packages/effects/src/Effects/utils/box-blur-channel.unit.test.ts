import { describe, it, expect } from "vitest"
import { boxBlurChannel, boxBlurChannels } from "./box-blur-channel"

describe("boxBlurChannel", () => {
	it("leaves a uniform array unchanged", () => {
		const src = new Float32Array(5 * 5).fill(42)
		const result = boxBlurChannel(src, 5, 5, 2)
		for (let i = 0; i < result.length; i++) {
			expect(result[i]).toBeCloseTo(42, 5)
		}
	})

	it("radius=0 returns an equal copy", () => {
		const src = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9])
		const result = boxBlurChannel(src, 3, 3, 0)
		expect(result).not.toBe(src)
		expect(Array.from(result)).toEqual(Array.from(src))
	})

	it("negative radius returns an equal copy", () => {
		const src = new Float32Array([1, 2, 3, 4])
		const result = boxBlurChannel(src, 2, 2, -3)
		expect(result).not.toBe(src)
		expect(Array.from(result)).toEqual(Array.from(src))
	})

	it("spreads a single spike to its neighbors", () => {
		const width = 7
		const height = 7
		const src = new Float32Array(width * height)
		const center = 3 * width + 3
		src[center] = 100

		const result = boxBlurChannel(src, width, height, 1)

		expect(result[center]).toBeGreaterThan(0)
		expect(result[center]).toBeLessThan(100)
		expect(result[center - 1]).toBeGreaterThan(0)
		expect(result[center + 1]).toBeGreaterThan(0)
		expect(result[center - width]).toBeGreaterThan(0)
		expect(result[center + width]).toBeGreaterThan(0)
	})

	it("preserves the total sum (within rounding)", () => {
		const width = 9
		const height = 9
		const src = new Float32Array(width * height)
		// Place a spike well away from the edges so no mass is clamped/duplicated.
		src[4 * width + 4] = 255

		const result = boxBlurChannel(src, width, height, 1)

		let srcSum = 0
		let resultSum = 0
		for (let i = 0; i < src.length; i++) {
			srcSum += src[i]
			resultSum += result[i]
		}
		expect(resultSum).toBeCloseTo(srcSum, 3)
	})

	it("does not mutate the input array", () => {
		const src = new Float32Array([10, 20, 30, 40, 50, 60, 70, 80, 90])
		const original = Array.from(src)
		boxBlurChannel(src, 3, 3, 1)
		expect(Array.from(src)).toEqual(original)
	})
})

describe("boxBlurChannels", () => {
	it("matches boxBlurChannel per-channel (byte-identical for representative radii)", () => {
		const width = 16
		const height = 16
		const count = width * height
		const channels: Float32Array[] = []

		for (let c = 0; c < 3; c++) {
			const channel = new Float32Array(count)
			// Deterministic per-channel content distinct from the others.
			for (let i = 0; i < count; i++) {
				channel[i] = ((i * 17 + c * 91) % 256) + c * 0.25
			}
			channels.push(channel)
		}

		for (const radius of [1, 3, 8]) {
			const expected = channels.map((c) => boxBlurChannel(c, width, height, radius))
			const actual = boxBlurChannels(channels, width, height, radius)

			for (let c = 0; c < 3; c++) {
				for (let i = 0; i < count; i++) {
					expect(actual[c]![i]).toBeCloseTo(expected[c]![i]!, 5)
				}
			}
		}
	})

	it("writes into caller-supplied output buffers when `into` is provided", () => {
		const width = 8
		const height = 8
		const count = width * height
		const channels: Float32Array[] = [
			new Float32Array(count).fill(10),
			new Float32Array(count).fill(20),
		]

		const into: Float32Array[] = [new Float32Array(count), new Float32Array(count)]
		const result = boxBlurChannels(channels, width, height, 2, into)

		expect(result).toBe(into)
		expect(result[0]).toBe(into[0])
		expect(result[1]).toBe(into[1])

		// Uniform input → uniform output (within rounding).
		for (let i = 0; i < count; i++) {
			expect(into[0]![i]).toBeCloseTo(10, 5)
			expect(into[1]![i]).toBeCloseTo(20, 5)
		}
	})

	it("allocates fresh output buffers when `into` is omitted", () => {
		const width = 4
		const height = 4
		const channels: Float32Array[] = [new Float32Array(16).fill(7)]
		const result = boxBlurChannels(channels, width, height, 1)

		expect(result).toHaveLength(1)
		expect(result[0]).not.toBe(channels[0])
		expect(result[0]).toBeInstanceOf(Float32Array)

		for (let i = 0; i < 16; i++) {
			expect(result[0]![i]).toBeCloseTo(7, 5)
		}
	})

	it("radius <= 0 copies inputs into outputs (no blur)", () => {
		const width = 3
		const height = 3
		const channels: Float32Array[] = [
			new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]),
			new Float32Array([9, 8, 7, 6, 5, 4, 3, 2, 1]),
		]

		const result0 = boxBlurChannels(channels, width, height, 0)
		expect(Array.from(result0[0]!)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
		expect(Array.from(result0[1]!)).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])

		// `into` path with radius=0 copies into the supplied buffer.
		const into: Float32Array[] = [new Float32Array(9), new Float32Array(9)]
		const resultNeg = boxBlurChannels(channels, width, height, -2, into)
		expect(resultNeg).toBe(into)
		expect(Array.from(into[0]!)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
		expect(Array.from(into[1]!)).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
	})

	it("does not mutate the input channels", () => {
		const width = 5
		const height = 5
		const channels: Float32Array[] = [
			new Float32Array(25).map((_, i) => i * 3),
			new Float32Array(25).map((_, i) => i * 7),
		]
		const originals = channels.map((c) => Array.from(c))

		boxBlurChannels(channels, width, height, 2)

		for (let c = 0; c < 2; c++) {
			expect(Array.from(channels[c]!)).toEqual(originals[c]!)
		}
	})
})
