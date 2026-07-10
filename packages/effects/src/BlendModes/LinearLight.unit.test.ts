import { describe, it, expect } from "vitest"
import { linearLight } from "./LinearLight"

describe("linearLight", () => {
	it("uses linear burn branch when s <= 0.5", () => {
		const [r, g, b] = linearLight(0.25, 0.25, 0.25, 0.6, 0.6, 0.6)
		expect(r).toBeCloseTo(0.1, 5)
		expect(g).toBeCloseTo(0.1, 5)
		expect(b).toBeCloseTo(0.1, 5)
	})

	it("uses linear dodge branch when s > 0.5", () => {
		const [r, g, b] = linearLight(0.75, 0.75, 0.75, 0.4, 0.4, 0.4)
		expect(r).toBeCloseTo(0.9, 5)
		expect(g).toBeCloseTo(0.9, 5)
		expect(b).toBeCloseTo(0.9, 5)
	})

	it("handles s=0.5 boundary", () => {
		const [r, g, b] = linearLight(0.5, 0.5, 0.5, 0.6, 0.6, 0.6)
		expect(r).toBeCloseTo(0.6, 5)
		expect(g).toBeCloseTo(0.6, 5)
		expect(b).toBeCloseTo(0.6, 5)
	})

	it("handles all zeros", () => {
		const [r, g, b] = linearLight(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		const [r, g, b] = linearLight(1, 1, 1, 1, 1, 1)
		expect(r).toBe(1)
		expect(g).toBe(1)
		expect(b).toBe(1)
	})
})
