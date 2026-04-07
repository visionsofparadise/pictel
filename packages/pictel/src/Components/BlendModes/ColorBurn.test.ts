import { describe, it, expect } from "vitest"
import { colorBurn } from "./ColorBurn"

describe("colorBurn", () => {
	it("darkens channels via color burn", () => {
		const [r, g, b] = colorBurn(0.8, 0.8, 0.8, 0.6, 0.6, 0.6)
		// colorBurn(dst, src) = max(0, 1 - (1 - dst) / src) = max(0, 1 - 0.4/0.8) = 0.5
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
		// colorBurn(0.1, 0.2) = max(0, 1 - 0.9/0.2) = max(0, -3.5) = 0
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})
})
