import { describe, it, expect } from "vitest"
import { difference } from "./Difference"

describe("difference", () => {
	it("computes absolute difference per channel", () => {
		const [r, g, b] = difference(0.8, 0.3, 0.5, 0.3, 0.7, 0.5)
		expect(r).toBeCloseTo(0.5, 5)
		expect(g).toBeCloseTo(0.4, 5)
		expect(b).toBeCloseTo(0, 5)
	})

	it("handles all zeros", () => {
		const [r, g, b] = difference(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		const [r, g, b] = difference(1, 1, 1, 1, 1, 1)
		expect(r).toBeCloseTo(0, 5)
		expect(g).toBeCloseTo(0, 5)
		expect(b).toBeCloseTo(0, 5)
	})

	it("returns 1 when inputs are 0 and 1", () => {
		const [r, g, b] = difference(0, 1, 0, 1, 0, 1)
		expect(r).toBeCloseTo(1, 5)
		expect(g).toBeCloseTo(1, 5)
		expect(b).toBeCloseTo(1, 5)
	})
})
