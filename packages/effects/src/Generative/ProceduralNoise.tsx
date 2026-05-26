/* eslint-disable react-hooks/preserve-manual-memoization -- The `tint` tuple
 * may be passed as an inline JSX literal (fresh identity each render). We use
 * `tintKey` (a serialized content hash) in deps so `draw` stays referentially
 * stable. React Compiler infers `tint` as the dep and flags this; the
 * substitution is intentional. */
import { useCallback } from "react"
import alea from "alea"
import { createNoise2D } from "simplex-noise"
import { RasterSource } from "pictel"

export function fbm(
	noise2D: (x: number, y: number) => number,
	x: number,
	y: number,
	scale: number,
	octaves: number,
	persistence: number,
): number {
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

interface ProceduralNoiseProps {
	/** Output width in pixels. Required — generatives produce pixels at intrinsic dimensions. */
	width: number
	/** Output height in pixels. Required — generatives produce pixels at intrinsic dimensions. */
	height: number
	/** Noise algorithm. `"simplex"` or `"perlin"` (uses simplex with seed offset). */
	type: "simplex" | "perlin"
	/** Random seed for reproducible patterns. */
	seed: number
	/** Frequency scale. Smaller values produce larger features. Default 0.01. */
	scale?: number
	/** Number of noise layers for fBm detail. Default 1. */
	octaves?: number
	/** Amplitude falloff per octave. Default 0.5. */
	persistence?: number
	/** RGB tint [r, g, b] (0-255). Default: grayscale. */
	tint?: [number, number, number]
}

/**
 * Generates procedural noise textures using simplex noise with fractal Brownian motion.
 *
 * Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
 * `width` and `height` explicitly. The component does not respond to its container's
 * size. Wrap in a styled div if positioning is needed.
 *
 * - `width` — Output width in pixels. Required.
 * - `height` — Output height in pixels. Required.
 * - `type` — Noise algorithm. `"simplex"` or `"perlin"` (uses simplex with seed offset).
 * - `seed` — Random seed for reproducible patterns.
 * - `scale` — Frequency scale. Smaller values produce larger features. Default 0.01.
 * - `octaves` — Number of noise layers for fBm detail. Default 1.
 * - `persistence` — Amplitude falloff per octave. Default 0.5.
 * - `tint` — RGB tint [r, g, b] (0-255). Default: grayscale.
 *
 * @param props
 * @category Generative
 */
export function ProceduralNoise({
	width,
	height,
	type,
	seed,
	scale = 0.01,
	octaves = 1,
	persistence = 0.5,
	tint,
}: ProceduralNoiseProps) {
	// Content key, not tuple identity — inline `tint` literals would otherwise re-acquire pending every render.
	const tintKey = tint ? tint.join(",") : ""

	 
	const draw = useCallback(
		(canvas: HTMLCanvasElement) => {
			const context = canvas.getContext("2d")

			if (!context) return

			// "perlin" mode is simplex with a seed offset — simplex-noise has no perlin implementation.
			const noiseSeed = type === "perlin" ? seed + 0.5 : seed
			// alea's type declaration uses `any` args; the cast satisfies strict TS.
			const prng: () => number = alea(noiseSeed)
			const noise2D = createNoise2D(prng)

			const imageData = context.createImageData(width, height)
			const data = imageData.data

			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					const value = fbm(noise2D, x, y, scale, octaves, persistence)
					const offset = (y * width + x) * 4

					if (tint) {
						data[offset] = tint[0] * value
						data[offset + 1] = tint[1] * value
						data[offset + 2] = tint[2] * value
					} else {
						const gray = value * 255
						data[offset] = gray
						data[offset + 1] = gray
						data[offset + 2] = gray
					}

					data[offset + 3] = 255
				}
			}

			context.putImageData(imageData, 0, 0)
		},
		[width, height, type, seed, scale, octaves, persistence, tintKey],
	)

	return <RasterSource width={width} height={height} draw={draw} />
}
