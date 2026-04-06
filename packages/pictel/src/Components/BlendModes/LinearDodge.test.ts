import { describe, it, expect } from "vitest"
import { linearDodge } from "./LinearDodge"

describe("linearDodge", () => {
	it("clamps sum above 1", () => {
		const [r, g, b] = linearDodge(0.6, 0.6, 0.6, 0.6, 0.6, 0.6)
		expect(r).toBe(1)
		expect(g).toBe(1)
		expect(b).toBe(1)
	})

	it("sums without clamping when below 1", () => {
		const [r, g, b] = linearDodge(0.3, 0.3, 0.3, 0.4, 0.4, 0.4)
		expect(r).toBeCloseTo(0.7, 5)
		expect(g).toBeCloseTo(0.7, 5)
		expect(b).toBeCloseTo(0.7, 5)
	})

	it("handles all zeros", () => {
		const [r, g, b] = linearDodge(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		const [r, g, b] = linearDodge(1, 1, 1, 1, 1, 1)
		expect(r).toBe(1)
		expect(g).toBe(1)
		expect(b).toBe(1)
	})
})
