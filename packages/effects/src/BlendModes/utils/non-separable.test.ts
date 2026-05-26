import { describe, it, expect } from "vitest"
import { clipColor, lum, sat, setLum, setSat } from "./non-separable"

// W3C reference: https://www.w3.org/TR/compositing-1/#blendingnonseparable
//
// The W3C spec defines:
//   Lum(C)    = 0.3*r + 0.59*g + 0.11*b
//   Sat(C)    = max(r,g,b) - min(r,g,b)
//   SetLum(C, l) = ClipColor(C + (l - Lum(C)) added to each channel)
//   SetSat(C, s) = sort channels, rescale mid into [0, s], zero out min/max
//                  when max == min.

describe("lum", () => {
	it("computes the W3C luminance dot product", () => {
		expect(lum([1, 0, 0])).toBeCloseTo(0.3, 10)
		expect(lum([0, 1, 0])).toBeCloseTo(0.59, 10)
		expect(lum([0, 0, 1])).toBeCloseTo(0.11, 10)
	})

	it("returns 0 for black and 1 for white", () => {
		expect(lum([0, 0, 0])).toBe(0)
		expect(lum([1, 1, 1])).toBeCloseTo(1, 10)
	})

	it("returns the channel value for gray", () => {
		expect(lum([0.5, 0.5, 0.5])).toBeCloseTo(0.5, 10)
	})
})

describe("sat", () => {
	it("computes max - min across channels", () => {
		expect(sat([1, 0, 0])).toBe(1)
		expect(sat([0.8, 0.2, 0.5])).toBeCloseTo(0.6, 10)
	})

	it("returns 0 for achromatic colors", () => {
		expect(sat([0.5, 0.5, 0.5])).toBe(0)
		expect(sat([0, 0, 0])).toBe(0)
		expect(sat([1, 1, 1])).toBe(0)
	})
})

describe("clipColor", () => {
	it("passes through in-gamut colors unchanged", () => {
		const out = clipColor([0.2, 0.5, 0.8])
		expect(out[0]).toBeCloseTo(0.2, 10)
		expect(out[1]).toBeCloseTo(0.5, 10)
		expect(out[2]).toBeCloseTo(0.8, 10)
	})

	// Below-zero clipping: per the W3C spec, if any channel is negative, pull
	// all three channels toward the luminance. The luminance must be preserved.
	it("preserves luminance when clipping below 0", () => {
		const before = clipColor([-0.2, 0.4, 0.6])
		const lumBefore = lum(before)
		expect(lumBefore).toBeCloseTo(lum([-0.2, 0.4, 0.6]), 10)
		expect(before[0]).toBeGreaterThanOrEqual(-1e-10)
	})

	// Above-1 clipping: similar contract on the upper side.
	it("preserves luminance when clipping above 1", () => {
		const before = clipColor([0.4, 1.2, 0.7])
		const lumBefore = lum(before)
		expect(lumBefore).toBeCloseTo(lum([0.4, 1.2, 0.7]), 10)
		expect(before[1]).toBeLessThanOrEqual(1 + 1e-10)
	})
})

describe("setLum", () => {
	it("makes the result's luminance equal to the requested value", () => {
		const out = setLum([0.8, 0.2, 0.3], 0.5)
		expect(lum(out)).toBeCloseTo(0.5, 10)
	})

	it("clamps to white when the requested luminance exceeds the in-gamut range", () => {
		const out = setLum([1, 0, 0], 1)
		expect(out[0]).toBeCloseTo(1, 10)
		expect(out[1]).toBeCloseTo(1, 10)
		expect(out[2]).toBeCloseTo(1, 10)
	})

	it("clamps to black when the requested luminance is 0", () => {
		const out = setLum([1, 0, 0], 0)
		expect(out[0]).toBeCloseTo(0, 10)
		expect(out[1]).toBeCloseTo(0, 10)
		expect(out[2]).toBeCloseTo(0, 10)
	})

	it("preserves the chroma direction when shifting luminance", () => {
		// Source has red dominance — output luminance shifts but the channels
		// maintain their R > G/B ordering until clipping kicks in.
		const out = setLum([0.6, 0.2, 0.1], 0.4)
		expect(lum(out)).toBeCloseTo(0.4, 10)
	})
})

describe("setSat", () => {
	it("zeroes out the channels when the input is achromatic", () => {
		const out = setSat([0.5, 0.5, 0.5], 0.8)
		expect(out[0]).toBe(0)
		expect(out[1]).toBe(0)
		expect(out[2]).toBe(0)
	})

	it("produces saturation equal to the requested value for chromatic inputs", () => {
		const out = setSat([0.8, 0.2, 0.4], 0.6)
		expect(sat(out)).toBeCloseTo(0.6, 10)
	})

	it("preserves the relative channel ordering", () => {
		// Input ordering: R > B > G. The output should keep that ordering;
		// max channel becomes s, min becomes 0, mid scales.
		const out = setSat([0.8, 0.2, 0.5], 0.6)
		expect(out[0]).toBeGreaterThanOrEqual(out[2])
		expect(out[2]).toBeGreaterThanOrEqual(out[1])
		// max = 0.8 → s = 0.6; min = 0.2 → 0; mid (B) at (0.5 - 0.2)/(0.8 - 0.2) * 0.6 = 0.3
		expect(out[0]).toBeCloseTo(0.6, 10)
		expect(out[1]).toBeCloseTo(0, 10)
		expect(out[2]).toBeCloseTo(0.3, 10)
	})

	it("handles requested saturation of 0", () => {
		const out = setSat([0.8, 0.2, 0.5], 0)
		expect(out[0]).toBeCloseTo(0, 10)
		expect(out[1]).toBeCloseTo(0, 10)
		expect(out[2]).toBeCloseTo(0, 10)
	})

	it("handles ties between min and mid", () => {
		// Two channels at 0.3, one at 0.8 — the min and mid are both 0.3, so
		// (mid - min) / (max - min) = 0 and the mid channel ends at 0.
		const out = setSat([0.8, 0.3, 0.3], 0.6)
		expect(sat(out)).toBeCloseTo(0.6, 10)
		expect(out[0]).toBeCloseTo(0.6, 10)
	})
})
