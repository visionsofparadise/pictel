import { describe, it, expect } from "vitest"
import { saturation } from "./Saturation"

describe("saturation", () => {
	it("takes saturation from source, hue and lightness from dest", () => {
		const [r, g, b] = saturation(1, 0, 0, 0.6, 0.5, 0.5)
		expect(r).toBeDefined()
		expect(g).toBeDefined()
		expect(b).toBeDefined()
	})

	it("achromatic source desaturates dest", () => {
		const [r, g, b] = saturation(0.5, 0.5, 0.5, 1, 0, 0)
		expect(r).toBeCloseTo(g, 2)
		expect(g).toBeCloseTo(b, 2)
	})

	it("achromatic dest stays achromatic", () => {
		const [r, g, b] = saturation(1, 0, 0, 0.5, 0.5, 0.5)
		expect(r).toBeDefined()
		expect(g).toBeDefined()
		expect(b).toBeDefined()
	})

	it("handles black", () => {
		const [r, g, b] = saturation(1, 0, 0, 0, 0, 0)
		expect(r).toBeCloseTo(0, 2)
		expect(g).toBeCloseTo(0, 2)
		expect(b).toBeCloseTo(0, 2)
	})

	it("handles white", () => {
		const [r, g, b] = saturation(1, 0, 0, 1, 1, 1)
		expect(r).toBeCloseTo(1, 2)
		expect(g).toBeCloseTo(1, 2)
		expect(b).toBeCloseTo(1, 2)
	})
})
