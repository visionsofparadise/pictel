import { describe, expect, it } from "vitest"
import alea from "alea"
import { createNoise2D } from "simplex-noise"
import { fbm } from "./ProceduralNoise"

describe("ProceduralNoise determinism", () => {
	it("same seed produces identical noise values", () => {
		const coords = [
			[0, 0],
			[10, 20],
			[100, 200],
			[0.5, 0.5],
			[999, 999],
		]

		const noiseA = createNoise2D(alea(42))
		const noiseB = createNoise2D(alea(42))

		for (const [x, y] of coords) {
			expect(noiseA(x, y)).toBe(noiseB(x, y))
		}
	})

	it("different seeds produce different values", () => {
		const noiseA = createNoise2D(alea(42))
		const noiseB = createNoise2D(alea(99))

		let anyDifferent = false
		const coords = [
			[0, 0],
			[10, 20],
			[50, 50],
		]

		for (const [x, y] of coords) {
			if (noiseA(x, y) !== noiseB(x, y)) {
				anyDifferent = true
				break
			}
		}

		expect(anyDifferent).toBe(true)
	})

	it("fBm with 1 octave equals raw noise normalized", () => {
		const noise2D = createNoise2D(alea(42))

		const px = 10
		const py = 20
		const scale = 0.01

		const raw = noise2D(px * scale, py * scale)
		const normalized = (raw + 1) / 2

		const noise2DFresh = createNoise2D(alea(42))
		const fbmValue = fbm(noise2DFresh, px, py, scale, 1, 0.5)

		expect(fbmValue).toBeCloseTo(normalized, 10)
	})

	it("fBm with 2 octaves differs from 1 octave", () => {
		const noise1 = createNoise2D(alea(42))
		const noise2 = createNoise2D(alea(42))

		const px = 10
		const py = 20
		const scale = 0.01

		const oneOctave = fbm(noise1, px, py, scale, 1, 0.5)
		const twoOctaves = fbm(noise2, px, py, scale, 2, 0.5)

		expect(oneOctave).not.toBe(twoOctaves)
	})

	it("all normalized values fall in [0, 1]", () => {
		const noise2D = createNoise2D(alea(42))

		for (let x = 0; x < 100; x++) {
			for (let y = 0; y < 100; y++) {
				const value = fbm(noise2D, x, y, 0.01, 4, 0.5)
				expect(value).toBeGreaterThanOrEqual(0)
				expect(value).toBeLessThanOrEqual(1)
			}
		}
	})
})
