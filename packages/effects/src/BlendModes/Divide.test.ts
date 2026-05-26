import { describe, it, expect } from "vitest"
import { divide } from "./Divide"

describe("divide", () => {
	it("divides destination by source", () => {
		const [r, g, b] = divide(0.5, 0.5, 0.5, 0.25, 0.25, 0.25)
		expect(r).toBeCloseTo(0.5, 5)
		expect(g).toBeCloseTo(0.5, 5)
		expect(b).toBeCloseTo(0.5, 5)
	})

	it("returns 1 when source is zero", () => {
		const [r, g, b] = divide(0, 0, 0, 0.5, 0.5, 0.5)
		expect(r).toBe(1)
		expect(g).toBe(1)
		expect(b).toBe(1)
	})

	it("handles all zeros", () => {
		const [r, g, b] = divide(0, 0, 0, 0, 0, 0)
		expect(r).toBe(1)
		expect(g).toBe(1)
		expect(b).toBe(1)
	})

	it("handles all ones", () => {
		const [r, g, b] = divide(1, 1, 1, 1, 1, 1)
		expect(r).toBe(1)
		expect(g).toBe(1)
		expect(b).toBe(1)
	})
})
