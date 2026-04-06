import { describe, it, expect } from "vitest"
import { vividLight } from "./VividLight"

describe("vividLight", () => {
	it("uses colorBurn branch when s <= 0.5", () => {
		// s=0.25, d=0.6 → colorBurn(0.6, 2*0.25=0.5) = max(0, 1 - (1-0.6)/0.5) = max(0, 1 - 0.8) = 0.2
		const [r, g, b] = vividLight(0.25, 0.25, 0.25, 0.6, 0.6, 0.6)
		expect(r).toBeCloseTo(0.2, 5)
		expect(g).toBeCloseTo(0.2, 5)
		expect(b).toBeCloseTo(0.2, 5)
	})

	it("uses colorDodge branch when s > 0.5", () => {
		// s=0.75, d=0.4 → colorDodge(0.4, 2*0.75-1=0.5) = min(1, 0.4/(1-0.5)) = min(1, 0.8) = 0.8
		const [r, g, b] = vividLight(0.75, 0.75, 0.75, 0.4, 0.4, 0.4)
		expect(r).toBeCloseTo(0.8, 5)
		expect(g).toBeCloseTo(0.8, 5)
		expect(b).toBeCloseTo(0.8, 5)
	})

	it("handles s=0.5 boundary (colorBurn branch)", () => {
		// s=0.5, d=0.6 → colorBurn(0.6, 2*0.5=1.0) = max(0, 1 - (1-0.6)/1.0) = 0.6
		const [r, g, b] = vividLight(0.5, 0.5, 0.5, 0.6, 0.6, 0.6)
		expect(r).toBeCloseTo(0.6, 5)
		expect(g).toBeCloseTo(0.6, 5)
		expect(b).toBeCloseTo(0.6, 5)
	})

	it("handles all zeros", () => {
		// s=0, d=0 → colorBurn(0, 0) = 0
		const [r, g, b] = vividLight(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		// s=1, d=1 → colorDodge(1, 2*1-1=1) → s===1 ? 1
		const [r, g, b] = vividLight(1, 1, 1, 1, 1, 1)
		expect(r).toBe(1)
		expect(g).toBe(1)
		expect(b).toBe(1)
	})
})
