import { describe, it, expect } from "vitest"
import { luminosity } from "./Luminosity"

describe("luminosity", () => {
	it("takes lightness from source, hue and saturation from dest", () => {
		const [r, g, b] = luminosity(0.9, 0.9, 0.9, 0.5, 0, 0)
		expect(r).toBeGreaterThan(g)
		expect(r).toBeGreaterThan(b)
	})

	it("achromatic dest with source lightness returns gray", () => {
		const [r, g, b] = luminosity(1, 0, 0, 0.5, 0.5, 0.5)
		expect(r).toBeCloseTo(g, 2)
		expect(g).toBeCloseTo(b, 2)
	})

	it("handles black source", () => {
		const [r, g, b] = luminosity(0, 0, 0, 1, 0, 0)
		expect(r).toBeCloseTo(0, 2)
		expect(g).toBeCloseTo(0, 2)
		expect(b).toBeCloseTo(0, 2)
	})

	it("handles white source", () => {
		const [r, g, b] = luminosity(1, 1, 1, 1, 0, 0)
		expect(r).toBeCloseTo(1, 2)
		expect(g).toBeCloseTo(1, 2)
		expect(b).toBeCloseTo(1, 2)
	})

	it("preserves dest hue with different source lightness", () => {
		const [r, g, b] = luminosity(0.5, 0.5, 0.5, 0, 1, 0)
		expect(g).toBeGreaterThan(r)
		expect(g).toBeGreaterThan(b)
	})
})
