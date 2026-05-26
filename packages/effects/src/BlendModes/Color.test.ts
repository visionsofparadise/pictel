import { describe, it, expect } from "vitest"
import { color } from "./Color"

describe("color", () => {
	it("takes hue and saturation from source, lightness from dest", () => {
		const [r, g, b] = color(1, 0, 0, 0.5, 0.5, 0.5)
		expect(r).toBeGreaterThan(g)
		expect(r).toBeGreaterThan(b)
	})

	it("achromatic source returns gray at dest lightness", () => {
		const [r, g, b] = color(0.5, 0.5, 0.5, 1, 0, 0)
		expect(r).toBeCloseTo(g, 2)
		expect(g).toBeCloseTo(b, 2)
	})

	it("handles black dest", () => {
		const [r, g, b] = color(1, 0, 0, 0, 0, 0)
		expect(r).toBeCloseTo(0, 2)
		expect(g).toBeCloseTo(0, 2)
		expect(b).toBeCloseTo(0, 2)
	})

	it("handles white dest", () => {
		const [r, g, b] = color(1, 0, 0, 1, 1, 1)
		expect(r).toBeCloseTo(1, 2)
		expect(g).toBeCloseTo(1, 2)
		expect(b).toBeCloseTo(1, 2)
	})

	it("pure primary source on medium gray dest", () => {
		const [r, g, b] = color(0, 0, 1, 0.5, 0.5, 0.5)
		expect(b).toBeGreaterThan(r)
		expect(b).toBeGreaterThan(g)
	})
})
