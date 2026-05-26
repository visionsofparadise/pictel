import { describe, it, expect } from "vitest"
import { hardLight } from "./HardLight"

describe("hardLight", () => {
	it("uses multiply branch when source <= 0.5", () => {
		const [r] = hardLight(0.4, 0, 0, 0.6, 0, 0)
		expect(r).toBeCloseTo(2 * 0.4 * 0.6, 5)
	})

	it("uses screen branch when source > 0.5", () => {
		const [r] = hardLight(0.8, 0, 0, 0.6, 0, 0)
		expect(r).toBeCloseTo(1 - 2 * (1 - 0.8) * (1 - 0.6), 5)
	})

	it("handles all zeros", () => {
		const [r, g, b] = hardLight(0, 0, 0, 0, 0, 0)
		expect(r).toBe(0)
		expect(g).toBe(0)
		expect(b).toBe(0)
	})

	it("handles all ones", () => {
		const [r, g, b] = hardLight(1, 1, 1, 1, 1, 1)
		expect(r).toBeCloseTo(1, 5)
		expect(g).toBeCloseTo(1, 5)
		expect(b).toBeCloseTo(1, 5)
	})

	it("boundary at source = 0.5", () => {
		const [r] = hardLight(0.5, 0, 0, 0.6, 0, 0)
		expect(r).toBeCloseTo(0.6, 5)
	})
})
