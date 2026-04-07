import { describe, it, expect } from "vitest"
import { softLight } from "./SoftLight"

describe("softLight", () => {
	it("darkens when source < 0.5", () => {
		const [r] = softLight(0.25, 0, 0, 0.5, 0, 0)
		// sr <= 0.5: dr - (1 - 2*sr) * dr * (1 - dr) = 0.5 - 0.5 * 0.5 * 0.5 = 0.375
		expect(r).toBeCloseTo(0.375, 5)
	})

	it("lightens when source > 0.5", () => {
		const [r] = softLight(0.75, 0, 0, 0.5, 0, 0)
		// sr > 0.5: dr + (2*sr - 1) * (D(dr) - dr)
		// D(0.5) = sqrt(0.5) ≈ 0.7071
		// 0.5 + 0.5 * (0.7071 - 0.5) = 0.5 + 0.5 * 0.2071 = 0.60355
		expect(r).toBeCloseTo(0.60355, 4)
	})

	it("uses piecewise D function for dr <= 0.25", () => {
		const [r] = softLight(0.75, 0, 0, 0.2, 0, 0)
		// D(0.2) = ((16*0.2 - 12)*0.2 + 4)*0.2 = ((3.2 - 12)*0.2 + 4)*0.2 = (-1.76 + 4)*0.2 = 2.24*0.2 = 0.448
		// sr > 0.5: 0.2 + (1.5 - 1) * (0.448 - 0.2) = 0.2 + 0.5 * 0.248 = 0.324
		expect(r).toBeCloseTo(0.324, 4)
	})

	it("handles all zeros", () => {
		const [r, g, b] = softLight(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		const [r, g, b] = softLight(1, 1, 1, 1, 1, 1)
		expect(r).toBeCloseTo(1, 5)
		expect(g).toBeCloseTo(1, 5)
		expect(b).toBeCloseTo(1, 5)
	})

	it("identity when source is 0.5", () => {
		const [r, g, b] = softLight(0.5, 0.5, 0.5, 0.3, 0.5, 0.7)
		// sr = 0.5: dr - (1 - 1) * dr * (1 - dr) = dr
		expect(r).toBeCloseTo(0.3, 5)
		expect(g).toBeCloseTo(0.5, 5)
		expect(b).toBeCloseTo(0.7, 5)
	})
})
