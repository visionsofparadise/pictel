import { describe, it, expect } from "vitest"
import { overlay } from "./Overlay"

describe("overlay", () => {
	it("uses multiply branch when dest <= 0.5", () => {
		const [r] = overlay(0.6, 0, 0, 0.4, 0, 0)
		expect(r).toBeCloseTo(2 * 0.6 * 0.4, 5)
	})

	it("uses screen branch when dest > 0.5", () => {
		const [r] = overlay(0.6, 0, 0, 0.8, 0, 0)
		expect(r).toBeCloseTo(1 - 2 * (1 - 0.6) * (1 - 0.8), 5)
	})

	it("handles all zeros", () => {
		const [r, g, b] = overlay(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		const [r, g, b] = overlay(1, 1, 1, 1, 1, 1)
		expect(r).toBeCloseTo(1, 5)
		expect(g).toBeCloseTo(1, 5)
		expect(b).toBeCloseTo(1, 5)
	})

	it("boundary at dest = 0.5", () => {
		const [r] = overlay(0.6, 0, 0, 0.5, 0, 0)
		// dr <= 0.5 uses multiply branch: 2 * 0.6 * 0.5 = 0.6
		expect(r).toBeCloseTo(0.6, 5)
	})
})
