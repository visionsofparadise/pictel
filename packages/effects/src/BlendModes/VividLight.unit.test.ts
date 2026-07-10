import { describe, it, expect } from "vitest"
import { vividLight } from "./VividLight"

describe("vividLight", () => {
	it("uses colorBurn branch when s <= 0.5", () => {
		const [r, g, b] = vividLight(0.25, 0.25, 0.25, 0.6, 0.6, 0.6)
		expect(r).toBeCloseTo(0.2, 5)
		expect(g).toBeCloseTo(0.2, 5)
		expect(b).toBeCloseTo(0.2, 5)
	})

	it("uses colorDodge branch when s > 0.5", () => {
		const [r, g, b] = vividLight(0.75, 0.75, 0.75, 0.4, 0.4, 0.4)
		expect(r).toBeCloseTo(0.8, 5)
		expect(g).toBeCloseTo(0.8, 5)
		expect(b).toBeCloseTo(0.8, 5)
	})

	it("handles s=0.5 boundary (colorBurn branch)", () => {
		const [r, g, b] = vividLight(0.5, 0.5, 0.5, 0.6, 0.6, 0.6)
		expect(r).toBeCloseTo(0.6, 5)
		expect(g).toBeCloseTo(0.6, 5)
		expect(b).toBeCloseTo(0.6, 5)
	})

	it("handles all zeros", () => {
		const [r, g, b] = vividLight(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		const [r, g, b] = vividLight(1, 1, 1, 1, 1, 1)
		expect(r).toBe(1)
		expect(g).toBe(1)
		expect(b).toBe(1)
	})
})
