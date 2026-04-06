import { describe, it, expect } from "vitest"
import { hardMix } from "./HardMix"

describe("hardMix", () => {
	it("outputs strictly 0 or 1 per channel", () => {
		const [r, g, b] = hardMix(0.6, 0.6, 0.6, 0.8, 0.8, 0.8)
		expect(r === 0 || r === 1).toBe(true)
		expect(g === 0 || g === 1).toBe(true)
		expect(b === 0 || b === 1).toBe(true)
	})

	it("returns 1 when vividLight >= 0.5", () => {
		// s=0.75, d=0.4 → vividLight = 0.8 >= 0.5 → 1
		const [r, g, b] = hardMix(0.75, 0.75, 0.75, 0.4, 0.4, 0.4)
		expect(r).toBe(1)
		expect(g).toBe(1)
		expect(b).toBe(1)
	})

	it("returns 0 when vividLight < 0.5", () => {
		// s=0.25, d=0.6 → vividLight = 0.2 < 0.5 → 0
		const [r, g, b] = hardMix(0.25, 0.25, 0.25, 0.6, 0.6, 0.6)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles s=0.5 boundary", () => {
		// s=0.5, d=0.6 → vividLight = 0.6 >= 0.5 → 1
		const [r, g, b] = hardMix(0.5, 0.5, 0.5, 0.6, 0.6, 0.6)
		expect(r).toBe(1)
		expect(g).toBe(1)
		expect(b).toBe(1)
	})

	it("handles all zeros", () => {
		const [r, g, b] = hardMix(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		const [r, g, b] = hardMix(1, 1, 1, 1, 1, 1)
		expect(r).toBe(1)
		expect(g).toBe(1)
		expect(b).toBe(1)
	})
})
