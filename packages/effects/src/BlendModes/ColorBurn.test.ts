import { describe, it, expect } from "vitest"
import { colorBurn } from "./ColorBurn"

describe("colorBurn", () => {
	it("darkens channels via color burn", () => {
		const [r, g, b] = colorBurn(0.8, 0.8, 0.8, 0.6, 0.6, 0.6)
		expect(r).toBeCloseTo(0.5, 5)
		expect(g).toBeCloseTo(0.5, 5)
		expect(b).toBeCloseTo(0.5, 5)
	})

	it("returns zero when source is zero", () => {
		const [r, g, b] = colorBurn(0, 0, 0, 0.5, 0.5, 0.5)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		const [r, g, b] = colorBurn(1, 1, 1, 1, 1, 1)
		expect(r).toBeCloseTo(1, 5)
		expect(g).toBeCloseTo(1, 5)
		expect(b).toBeCloseTo(1, 5)
	})

	it("clamps to zero for low dest values", () => {
		const [r, g, b] = colorBurn(0.2, 0.2, 0.2, 0.1, 0.1, 0.1)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})
})
