import { describe, it, expect } from "vitest"
import { boxBlurChannel } from "./box-blur-channel"

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

		// The spike's value is reduced as it spreads.
		expect(result[center]).toBeGreaterThan(0)
		expect(result[center]).toBeLessThan(100)
		// Immediate orthogonal neighbors receive some of the energy.
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
