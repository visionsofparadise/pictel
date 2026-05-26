import { describe, it, expect } from "vitest"
import { multiply } from "./Multiply"

describe("multiply", () => {
	it("multiplies channels", () => {
		const [r, g, b] = multiply(0.5, 0.8, 0.6, 0.4, 0.5, 1.0)
		expect(r).toBeCloseTo(0.2, 5)
		expect(g).toBeCloseTo(0.4, 5)
		expect(b).toBeCloseTo(0.6, 5)
	})

	it("handles all zeros", () => {
		const [r, g, b] = multiply(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		const [r, g, b] = multiply(1, 1, 1, 1, 1, 1)
		expect(r).toBeCloseTo(1, 5)
		expect(g).toBeCloseTo(1, 5)
		expect(b).toBeCloseTo(1, 5)
	})

	it("returns zero when either input is zero", () => {
		const [r, g, b] = multiply(0, 0.5, 1, 0.8, 0, 0.3)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBeCloseTo(0.3, 5)
	})

	it("identity when one input is 1", () => {
		const [r, g, b] = multiply(1, 1, 1, 0.3, 0.5, 0.7)
		expect(r).toBeCloseTo(0.3, 5)
		expect(g).toBeCloseTo(0.5, 5)
		expect(b).toBeCloseTo(0.7, 5)
	})
})
