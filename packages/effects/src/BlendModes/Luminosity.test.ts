import { describe, it, expect } from "vitest"
import { luminosity } from "./Luminosity"

describe("luminosity", () => {
	it("takes lightness from source, hue and saturation from dest", () => {
		// Bright source, dark red dest
		const [r, g, b] = luminosity(0.9, 0.9, 0.9, 0.5, 0, 0)
		// Result should be reddish (dest hue/sat) but brighter (source lightness)
		expect(r).toBeGreaterThan(g)
		expect(r).toBeGreaterThan(b)
	})

	it("achromatic dest with source lightness returns gray", () => {
		// Colored source, gray dest (sat=0)
		const [r, g, b] = luminosity(1, 0, 0, 0.5, 0.5, 0.5)
		// Dest sat=0, so hslToRgb with sat=0 returns gray at source's lightness
		expect(r).toBeCloseTo(g, 2)
		expect(g).toBeCloseTo(b, 2)
	})

	it("handles black source", () => {
		const [r, g, b] = luminosity(0, 0, 0, 1, 0, 0)
		// Source lightness=0 → black regardless of dest hue/sat
		expect(r).toBeCloseTo(0, 2)
		expect(g).toBeCloseTo(0, 2)
		expect(b).toBeCloseTo(0, 2)
	})

	it("handles white source", () => {
		const [r, g, b] = luminosity(1, 1, 1, 1, 0, 0)
		// Source lightness=1 → white regardless of dest hue/sat
		expect(r).toBeCloseTo(1, 2)
		expect(g).toBeCloseTo(1, 2)
		expect(b).toBeCloseTo(1, 2)
	})

	it("preserves dest hue with different source lightness", () => {
		// Green dest, medium source lightness
		const [r, g, b] = luminosity(0.5, 0.5, 0.5, 0, 1, 0)
		// Result should be greenish at source's lightness
		expect(g).toBeGreaterThan(r)
		expect(g).toBeGreaterThan(b)
	})
})
