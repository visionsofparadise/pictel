import type { ComponentPropsWithoutRef } from "react"
import { useEffect, useRef } from "react"
import alea from "alea"
import { createNoise2D } from "simplex-noise"
import { useContainerSize } from "../../hooks/useContainerSize"

/** Fractal Brownian motion — layers multiple octaves of noise for natural-looking variation. */
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

interface ProceduralNoiseProps extends ComponentPropsWithoutRef<"div"> {
	type: "simplex" | "perlin"
	seed: number
	scale?: number
	octaves?: number
	persistence?: number
	// Named "tint" instead of "color" to avoid conflict with the HTML "color"
	// attribute inherited from ComponentPropsWithoutRef<'div'>.
	/** RGB tint values, each in [0, 255]. Default: monochrome (grayscale). */
	tint?: [number, number, number]
}

export function ProceduralNoise({
	type,
	seed,
	scale = 0.01,
	octaves = 1,
	persistence = 0.5,
	tint,
	style,
	...rest
}: ProceduralNoiseProps) {
	const { ref, width, height } = useContainerSize()
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		const canvas = canvasRef.current

		if (!canvas || width === 0 || height === 0) return

		canvas.width = width
		canvas.height = height

		const context = canvas.getContext("2d")

		if (!context) return

		// simplex-noise only provides simplex noise. "perlin" mode uses simplex
		// with a seed offset to produce a visually distinct but structurally
		// equivalent noise field.
		const noiseSeed = type === "perlin" ? seed + 0.5 : seed
		const noise2D = createNoise2D(alea(noiseSeed))

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
	}, [width, height, type, seed, scale, octaves, persistence, tint?.[0], tint?.[1], tint?.[2]])

	return (
		<div ref={ref} style={{ width: "100%", height: "100%", ...style }} {...rest}>
			<canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
		</div>
	)
}
