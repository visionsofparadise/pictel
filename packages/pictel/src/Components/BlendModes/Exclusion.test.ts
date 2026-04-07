import { describe, it, expect } from "vitest"
import { exclusion } from "./Exclusion"

describe("exclusion", () => {
	it("computes exclusion per channel", () => {
		const [r, g, b] = exclusion(0.5, 0.8, 0.6, 0.4, 0.5, 1.0)
		expect(r).toBeCloseTo(0.5 + 0.4 - 2 * 0.5 * 0.4, 5)
		expect(g).toBeCloseTo(0.8 + 0.5 - 2 * 0.8 * 0.5, 5)
		expect(b).toBeCloseTo(0.6 + 1.0 - 2 * 0.6 * 1.0, 5)
	})

	it("handles all zeros", () => {
		const [r, g, b] = exclusion(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		const [r, g, b] = exclusion(1, 1, 1, 1, 1, 1)
		expect(r).toBeCloseTo(0, 5)
		expect(g).toBeCloseTo(0, 5)
		expect(b).toBeCloseTo(0, 5)
	})

	it("returns dest when source is 0", () => {
		const [r, g, b] = exclusion(0, 0, 0, 0.3, 0.5, 0.7)
		expect(r).toBeCloseTo(0.3, 5)
		expect(g).toBeCloseTo(0.5, 5)
		expect(b).toBeCloseTo(0.7, 5)
	})
})
