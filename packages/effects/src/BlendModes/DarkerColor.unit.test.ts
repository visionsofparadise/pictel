import { describe, it, expect } from "vitest"
import { darkerColor } from "./DarkerColor"

describe("darkerColor", () => {
	it("returns source when source is darker", () => {
		const [r, g, b] = darkerColor(0.1, 0.1, 0.1, 0.9, 0.9, 0.9)
		expect(r).toBeCloseTo(0.1, 5)
		expect(g).toBeCloseTo(0.1, 5)
		expect(b).toBeCloseTo(0.1, 5)
	})

	it("returns destination when destination is darker", () => {
		const [r, g, b] = darkerColor(0.9, 0.9, 0.9, 0.1, 0.1, 0.1)
		expect(r).toBeCloseTo(0.1, 5)
		expect(g).toBeCloseTo(0.1, 5)
		expect(b).toBeCloseTo(0.1, 5)
	})

	it("returns destination when luminances are equal", () => {
		const [r, g, b] = darkerColor(0.5, 0.5, 0.5, 0.5, 0.5, 0.5)
		expect(r).toBeCloseTo(0.5, 5)
		expect(g).toBeCloseTo(0.5, 5)
		expect(b).toBeCloseTo(0.5, 5)
	})

	it("handles all zeros", () => {
		const [r, g, b] = darkerColor(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		const [r, g, b] = darkerColor(1, 1, 1, 1, 1, 1)
		expect(r).toBe(1)
		expect(g).toBe(1)
		expect(b).toBe(1)
	})
})
