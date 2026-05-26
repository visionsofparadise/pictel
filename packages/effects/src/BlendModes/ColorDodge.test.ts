import { describe, it, expect } from "vitest"
import { colorDodge } from "./ColorDodge"

describe("colorDodge", () => {
	it("lightens channels via color dodge", () => {
		const [r, g, b] = colorDodge(0.5, 0.5, 0.5, 0.4, 0.4, 0.4)
		expect(r).toBeCloseTo(0.8, 5)
		expect(g).toBeCloseTo(0.8, 5)
		expect(b).toBeCloseTo(0.8, 5)
	})

	it("returns 1 when source is 1", () => {
		const [r, g, b] = colorDodge(1, 1, 1, 0.5, 0.5, 0.5)
		expect(r).toBe(1)
		expect(g).toBe(1)
		expect(b).toBe(1)
	})

	it("handles all zeros", () => {
		const [r, g, b] = colorDodge(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("clamps to 1 when result overflows", () => {
		const [r, g, b] = colorDodge(0.9, 0.9, 0.9, 0.8, 0.8, 0.8)
		expect(r).toBe(1)
		expect(g).toBe(1)
		expect(b).toBe(1)
	})
})
