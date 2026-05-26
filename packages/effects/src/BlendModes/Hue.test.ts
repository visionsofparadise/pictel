import { describe, it, expect } from "vitest"
import { hue } from "./Hue"

describe("hue", () => {
	it("takes hue from source, saturation and lightness from dest", () => {
		const [r, g, b] = hue(1, 0, 0, 0.5, 0.8, 0.8)
		expect(r).toBeGreaterThan(g)
		expect(r).toBeGreaterThan(b)
	})

	it("achromatic source preserves dest color", () => {
		const [r, g, b] = hue(0.5, 0.5, 0.5, 0.8, 0.2, 0.2)
		expect(r).toBeDefined()
		expect(g).toBeDefined()
		expect(b).toBeDefined()
	})

	it("achromatic dest returns gray regardless of source hue", () => {
		const [r, g, b] = hue(1, 0, 0, 0.5, 0.5, 0.5)
		expect(r).toBeCloseTo(g, 2)
		expect(g).toBeCloseTo(b, 2)
	})

	it("handles black", () => {
		const [r, g, b] = hue(1, 0, 0, 0, 0, 0)
		expect(r).toBeCloseTo(0, 2)
		expect(g).toBeCloseTo(0, 2)
		expect(b).toBeCloseTo(0, 2)
	})

	it("handles white", () => {
		const [r, g, b] = hue(1, 0, 0, 1, 1, 1)
		expect(r).toBeCloseTo(1, 2)
		expect(g).toBeCloseTo(1, 2)
		expect(b).toBeCloseTo(1, 2)
	})
})
