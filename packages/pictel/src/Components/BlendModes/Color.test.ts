import { describe, it, expect } from "vitest"
import { color } from "./Color"

describe("color", () => {
	it("takes hue and saturation from source, lightness from dest", () => {
		// Red source, medium lightness dest
		const [r, g, b] = color(1, 0, 0, 0.5, 0.5, 0.5)
		// Result has source's hue (red) and saturation with dest's lightness
		expect(r).toBeGreaterThan(g)
		expect(r).toBeGreaterThan(b)
	})

	it("achromatic source returns gray at dest lightness", () => {
		// Gray source (sat=0), colored dest
		const [r, g, b] = color(0.5, 0.5, 0.5, 1, 0, 0)
		// Source sat=0, so hslToRgb with sat=0 returns gray at dest's lightness
		expect(r).toBeCloseTo(g, 2)
		expect(g).toBeCloseTo(b, 2)
	})

	it("handles black dest", () => {
		const [r, g, b] = color(1, 0, 0, 0, 0, 0)
		// Dest lightness=0 → black regardless of source hue/sat
		expect(r).toBeCloseTo(0, 2)
		expect(g).toBeCloseTo(0, 2)
		expect(b).toBeCloseTo(0, 2)
	})

	it("handles white dest", () => {
		const [r, g, b] = color(1, 0, 0, 1, 1, 1)
		// Dest lightness=1 → white regardless of source hue/sat
		expect(r).toBeCloseTo(1, 2)
		expect(g).toBeCloseTo(1, 2)
		expect(b).toBeCloseTo(1, 2)
	})

	it("pure primary source on medium gray dest", () => {
		// Blue source on 50% gray
		const [r, g, b] = color(0, 0, 1, 0.5, 0.5, 0.5)
		// Result should be blueish at dest's lightness
		expect(b).toBeGreaterThan(r)
		expect(b).toBeGreaterThan(g)
	})
})
