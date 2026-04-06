import { describe, it, expect } from "vitest"
import { lighterColor } from "./LighterColor"

describe("lighterColor", () => {
	it("returns source when source is lighter", () => {
		const [r, g, b] = lighterColor(0.9, 0.9, 0.9, 0.1, 0.1, 0.1)
		expect(r).toBeCloseTo(0.9, 5)
		expect(g).toBeCloseTo(0.9, 5)
		expect(b).toBeCloseTo(0.9, 5)
	})

	it("returns destination when destination is lighter", () => {
		const [r, g, b] = lighterColor(0.1, 0.1, 0.1, 0.9, 0.9, 0.9)
		expect(r).toBeCloseTo(0.9, 5)
		expect(g).toBeCloseTo(0.9, 5)
		expect(b).toBeCloseTo(0.9, 5)
	})

	it("returns destination when luminances are equal", () => {
		const [r, g, b] = lighterColor(0.5, 0.5, 0.5, 0.5, 0.5, 0.5)
		expect(r).toBeCloseTo(0.5, 5)
		expect(g).toBeCloseTo(0.5, 5)
		expect(b).toBeCloseTo(0.5, 5)
	})

	it("handles all zeros", () => {
		const [r, g, b] = lighterColor(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		const [r, g, b] = lighterColor(1, 1, 1, 1, 1, 1)
		expect(r).toBe(1)
		expect(g).toBe(1)
		expect(b).toBe(1)
	})
})
