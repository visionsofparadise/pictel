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
		const fbmValue = fbm(noise2DFresh, px, py, scale, scale, 1, 0.5)

		expect(fbmValue).toBeCloseTo(normalized, 10)
	})

	it("fBm with 2 octaves differs from 1 octave", () => {
		const noise1 = createNoise2D(alea(42))
		const noise2 = createNoise2D(alea(42))

		const px = 10
		const py = 20
		const scale = 0.01

		const oneOctave = fbm(noise1, px, py, scale, scale, 1, 0.5)
		const twoOctaves = fbm(noise2, px, py, scale, scale, 2, 0.5)

		expect(oneOctave).not.toBe(twoOctaves)
	})

	it("all normalized values fall in [0, 1]", () => {
		const noise2D = createNoise2D(alea(42))

		for (let x = 0; x < 100; x++) {
			for (let y = 0; y < 100; y++) {
				const value = fbm(noise2D, x, y, 0.01, 0.01, 4, 0.5)
				expect(value).toBeGreaterThanOrEqual(0)
				expect(value).toBeLessThanOrEqual(1)
			}
		}
	})
})

describe("ProceduralNoise anisotropic frequency", () => {
	it("scaleX === scaleY === N matches the pre-refactor isotropic fbm output exactly", () => {
		// Reference implementation: pre-refactor isotropic fbm with a single `scale` parameter.
		const referenceIsotropicFbm = (
			noise2D: (x: number, y: number) => number,
			x: number,
			y: number,
			scale: number,
			octaves: number,
			persistence: number,
		): number => {
			let value = 0
			let amplitude = 1
			let frequency = scale
			let maxAmplitude = 0
			for (let octave = 0; octave < octaves; octave++) {
				value += noise2D(x * frequency, y * frequency) * amplitude
				maxAmplitude += amplitude
				amplitude *= persistence
				frequency *= 2
			}
			return (value / maxAmplitude + 1) / 2
		}

		const scale = 0.01
		const octaves = 4
		const persistence = 0.5

		const coords: [number, number][] = [
			[0, 0],
			[10, 20],
			[37, 5],
			[100, 100],
			[0.5, 0.5],
			[256, 384],
		]

		for (const [x, y] of coords) {
			const referenceNoise = createNoise2D(alea(42))
			const newNoise = createNoise2D(alea(42))

			const expected = referenceIsotropicFbm(referenceNoise, x, y, scale, octaves, persistence)
			const actual = fbm(newNoise, x, y, scale, scale, octaves, persistence)

			expect(actual).toBe(expected)
		}
	})

	it("scaleX !== scaleY samples a different noise location than scaleX === scaleY at the same pixel", () => {
		// Cross-axis swap (scaleX,scaleY) vs (scaleY,scaleX) at a non-symmetric pixel
		// must produce a different output — proves the two axes are independently honored.
		const px = 37
		const py = 13
		const scaleX = 0.1
		const scaleY = 0.005

		const noiseA = createNoise2D(alea(42))
		const noiseB = createNoise2D(alea(42))

		const swapped = fbm(noiseA, px, py, scaleY, scaleX, 1, 0.5)
		const direct = fbm(noiseB, px, py, scaleX, scaleY, 1, 0.5)

		expect(direct).not.toBe(swapped)
	})

	it("scaleX !== scaleY differs from scaleX === scaleY at the same coords", () => {
		const px = 50
		const py = 50
		const octaves = 3

		const isoNoise = createNoise2D(alea(42))
		const anisoNoise = createNoise2D(alea(42))

		const iso = fbm(isoNoise, px, py, 0.05, 0.05, octaves, 0.5)
		const aniso = fbm(anisoNoise, px, py, 0.05, 0.005, octaves, 0.5)

		expect(iso).not.toBe(aniso)
	})
})
