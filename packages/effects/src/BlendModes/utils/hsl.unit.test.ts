import { describe, it, expect } from "vitest"
import { hslToRgb, rgbToHsl } from "./hsl"

describe("rgbToHsl", () => {
	it("converts pure red", () => {
		const [h, s, l] = rgbToHsl(255, 0, 0)
		expect(h).toBe(0)
		expect(s).toBe(1)
		expect(l).toBeCloseTo(0.5, 5)
	})

	it("converts pure green", () => {
		const [h, s, l] = rgbToHsl(0, 255, 0)
		expect(h).toBe(120)
		expect(s).toBe(1)
		expect(l).toBeCloseTo(0.5, 5)
	})

	it("converts pure blue", () => {
		const [h, s, l] = rgbToHsl(0, 0, 255)
		expect(h).toBe(240)
		expect(s).toBe(1)
		expect(l).toBeCloseTo(0.5, 5)
	})

	it("converts black", () => {
		const [h, s, l] = rgbToHsl(0, 0, 0)
		expect(h).toBe(0)
		expect(s).toBe(0)
		expect(l).toBe(0)
	})

	it("converts white", () => {
		const [h, s, l] = rgbToHsl(255, 255, 255)
		expect(h).toBe(0)
		expect(s).toBe(0)
		expect(l).toBe(1)
	})

	it("converts mid gray (achromatic)", () => {
		const [h, s, l] = rgbToHsl(128, 128, 128)
		expect(h).toBe(0)
		expect(s).toBe(0)
		expect(l).toBeCloseTo(128 / 255, 2)
	})
})

describe("hslToRgb", () => {
	it("converts pure red", () => {
		const [r, g, b] = hslToRgb(0, 1, 0.5)
		expect(r).toBe(255)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("converts pure green", () => {
		const [r, g, b] = hslToRgb(120, 1, 0.5)
		expect(r).toBe(0)
		expect(g).toBe(255)
		expect(b).toBe(0)
	})

	it("converts pure blue", () => {
		const [r, g, b] = hslToRgb(240, 1, 0.5)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(255)
	})

	it("converts black", () => {
		const [r, g, b] = hslToRgb(0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("converts white", () => {
		const [r, g, b] = hslToRgb(0, 0, 1)
		expect(r).toBe(255)
		expect(g).toBe(255)
		expect(b).toBe(255)
	})

	it("converts achromatic mid gray", () => {
		const [r, g, b] = hslToRgb(0, 0, 0.5)
		expect(r).toBe(128)
		expect(g).toBe(128)
		expect(b).toBe(128)
	})

	it("wraps hue above 360", () => {
		const [r, g, b] = hslToRgb(360, 1, 0.5)
		expect(r).toBe(255)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("wraps negative hue", () => {
		const [r, g, b] = hslToRgb(-120, 1, 0.5)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(255)
	})
})

describe("round-trip", () => {
	it("RGB -> HSL -> RGB preserves pure red", () => {
		const [h, s, l] = rgbToHsl(255, 0, 0)
		const [r, g, b] = hslToRgb(h, s, l)
		expect(r).toBe(255)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("RGB -> HSL -> RGB preserves pure green", () => {
		const [h, s, l] = rgbToHsl(0, 255, 0)
		const [r, g, b] = hslToRgb(h, s, l)
		expect(r).toBe(0)
		expect(g).toBe(255)
		expect(b).toBe(0)
	})

	it("RGB -> HSL -> RGB preserves pure blue", () => {
		const [h, s, l] = rgbToHsl(0, 0, 255)
		const [r, g, b] = hslToRgb(h, s, l)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(255)
	})

	it("RGB -> HSL -> RGB preserves arbitrary color", () => {
		const [h, s, l] = rgbToHsl(173, 42, 200)
		const [r, g, b] = hslToRgb(h, s, l)
		expect(r).toBe(173)
		expect(g).toBe(42)
		expect(b).toBe(200)
	})

	it("RGB -> HSL -> RGB preserves black", () => {
		const [h, s, l] = rgbToHsl(0, 0, 0)
		const [r, g, b] = hslToRgb(h, s, l)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("RGB -> HSL -> RGB preserves white", () => {
		const [h, s, l] = rgbToHsl(255, 255, 255)
		const [r, g, b] = hslToRgb(h, s, l)
		expect(r).toBe(255)
		expect(g).toBe(255)
		expect(b).toBe(255)
	})

	it("RGB -> HSL -> RGB preserves mid gray", () => {
		const [h, s, l] = rgbToHsl(128, 128, 128)
		const [r, g, b] = hslToRgb(h, s, l)
		expect(r).toBe(128)
		expect(g).toBe(128)
		expect(b).toBe(128)
	})
})
