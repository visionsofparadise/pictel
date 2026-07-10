import { describe, it, expect } from "vitest"
import { softLight } from "./SoftLight"

describe("softLight", () => {
	it("darkens when source < 0.5", () => {
		const [r] = softLight(0.25, 0, 0, 0.5, 0, 0)
		expect(r).toBeCloseTo(0.375, 5)
	})

	it("lightens when source > 0.5", () => {
		const [r] = softLight(0.75, 0, 0, 0.5, 0, 0)
		expect(r).toBeCloseTo(0.60355, 4)
	})

	it("uses piecewise D function for dr <= 0.25", () => {
		const [r] = softLight(0.75, 0, 0, 0.2, 0, 0)
		expect(r).toBeCloseTo(0.324, 4)
	})

	it("handles all zeros", () => {
		const [r, g, b] = softLight(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		const [r, g, b] = softLight(1, 1, 1, 1, 1, 1)
		expect(r).toBeCloseTo(1, 5)
		expect(g).toBeCloseTo(1, 5)
		expect(b).toBeCloseTo(1, 5)
	})

	it("identity when source is 0.5", () => {
		const [r, g, b] = softLight(0.5, 0.5, 0.5, 0.3, 0.5, 0.7)
		expect(r).toBeCloseTo(0.3, 5)
		expect(g).toBeCloseTo(0.5, 5)
		expect(b).toBeCloseTo(0.7, 5)
	})
})
