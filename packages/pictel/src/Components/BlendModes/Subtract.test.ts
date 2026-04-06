import { describe, it, expect } from "vitest"
import { subtract } from "./Subtract"

describe("subtract", () => {
	it("subtracts source from destination", () => {
		const [r, g, b] = subtract(0.3, 0.3, 0.3, 0.8, 0.8, 0.8)
		expect(r).toBeCloseTo(0.5, 5)
		expect(g).toBeCloseTo(0.5, 5)
		expect(b).toBeCloseTo(0.5, 5)
	})

	it("clamps negative results to zero", () => {
		const [r, g, b] = subtract(0.8, 0.8, 0.8, 0.3, 0.3, 0.3)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all zeros", () => {
		const [r, g, b] = subtract(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		const [r, g, b] = subtract(1, 1, 1, 1, 1, 1)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})
})
