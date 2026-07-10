import { describe, it, expect } from "vitest"
import { linearBurn } from "./LinearBurn"

describe("linearBurn", () => {
	it("subtracts complement per channel", () => {
		const [r, g, b] = linearBurn(0.6, 0.6, 0.6, 0.8, 0.8, 0.8)
		expect(r).toBeCloseTo(0.4, 5)
		expect(g).toBeCloseTo(0.4, 5)
		expect(b).toBeCloseTo(0.4, 5)
	})

	it("clamps negative results to zero", () => {
		const [r, g, b] = linearBurn(0.2, 0.2, 0.2, 0.3, 0.3, 0.3)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all zeros", () => {
		const [r, g, b] = linearBurn(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		const [r, g, b] = linearBurn(1, 1, 1, 1, 1, 1)
		expect(r).toBeCloseTo(1, 5)
		expect(g).toBeCloseTo(1, 5)
		expect(b).toBeCloseTo(1, 5)
	})
})
