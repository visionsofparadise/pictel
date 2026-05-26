import { describe, it, expect } from "vitest"
import { lighten } from "./Lighten"

describe("lighten", () => {
	it("picks maximum per channel", () => {
		const [r, g, b] = lighten(0.3, 0.8, 0.5, 0.7, 0.2, 0.5)
		expect(r).toBeCloseTo(0.7, 5)
		expect(g).toBeCloseTo(0.8, 5)
		expect(b).toBeCloseTo(0.5, 5)
	})

	it("handles all zeros", () => {
		const [r, g, b] = lighten(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		const [r, g, b] = lighten(1, 1, 1, 1, 1, 1)
		expect(r).toBe(1)
		expect(g).toBe(1)
		expect(b).toBe(1)
	})

	it("identity when source equals dest", () => {
		const [r, g, b] = lighten(0.5, 0.5, 0.5, 0.5, 0.5, 0.5)
		expect(r).toBeCloseTo(0.5, 5)
		expect(g).toBeCloseTo(0.5, 5)
		expect(b).toBeCloseTo(0.5, 5)
	})
})
