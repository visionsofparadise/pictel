import { useCallback } from "react"
import { RasterSource } from "pictel"

type VectorFieldPattern = "linear" | "radial" | "tangential"
type MagnitudeProfile = "constant" | "linear" | "falloff"

interface VectorFieldOptions {
	angle?: number
	centerX?: number
	centerY?: number
	magnitude?: MagnitudeProfile
}

export function buildVectorField(
	width: number,
	height: number,
	pattern: VectorFieldPattern,
	options: VectorFieldOptions = {},
): ImageData {
	const { angle = 0, centerX = 0.5, centerY = 0.5, magnitude = "constant" } = options

	const data = new Uint8ClampedArray(width * height * 4)

	const angleRad = (angle * Math.PI) / 180
	const linearCos = Math.cos(angleRad)
	const linearSin = Math.sin(angleRad)

	const pixelCenterX = centerX * width
	const pixelCenterY = centerY * height
	const maxRadius = Math.hypot(
		Math.max(pixelCenterX, width - pixelCenterX),
		Math.max(pixelCenterY, height - pixelCenterY),
	)

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const px = (y * width + x) * 4

			const dx = x + 0.5 - pixelCenterX
			const dy = y + 0.5 - pixelCenterY
			const distance = Math.hypot(dx, dy)

			let cos: number
			let sin: number
			let degenerate = false

			if (pattern === "linear") {
				cos = linearCos
				sin = linearSin
			} else if (distance === 0) {
				cos = 0
				sin = 0
				degenerate = true
			} else if (pattern === "radial") {
				cos = dx / distance
				sin = dy / distance
			} else {
				cos = -dy / distance
				sin = dx / distance
			}

			const radiusNorm = maxRadius === 0 ? 0 : distance / maxRadius
			const mag =
				magnitude === "linear"
					? radiusNorm
					: magnitude === "falloff"
						? 1 - radiusNorm
						: 1

			if (degenerate) {
				data[px] = 128
				data[px + 1] = 128
				data[px + 2] = 0
			} else {
				data[px] = Math.round((cos + 1) * 127.5)
				data[px + 1] = Math.round((sin + 1) * 127.5)
				data[px + 2] = Math.round(mag * 255)
			}

			data[px + 3] = 255
		}
	}

	return new ImageData(data, width, height)
}

/**
 * Synthesizes a parametric direction field at intrinsic dimensions, emitting the
 * same three-channel encoding as `Direction` (`R=(cos+1)·127.5`, `G=(sin+1)·127.5`,
 * `B=magnitude·255`). Drops directly into any field consumer — feed it through the
 * `map` prop on `LIC` (motion / zoom / spin blur) or magnitude-aware `DisplacementMap`
 * (twirl / pinch / spherize) or field-aligned `Hatch`.
 *
 * Like the gradient generatives it produces pixels at intrinsic dimensions: the
 * host/agent specifies `width` and `height` explicitly. The output is not meant to
 * be visually readable — it renders as red/green static.
 *
 * - `width` — Output width in pixels. Required.
 * - `height` — Output height in pixels. Required.
 * - `pattern` — `"linear"` (constant `(cos angle, sin angle)`), `"radial"` (unit
 *   vector pointing outward from the center), or `"tangential"` (radial rotated 90°,
 *   a swirl).
 * - `angle` — Direction in degrees for `linear`. 0 is left-to-right. Default 0.
 * - `centerX` — Horizontal center as a fraction of width, for `radial`/`tangential`. Default 0.5.
 * - `centerY` — Vertical center as a fraction of height, for `radial`/`tangential`. Default 0.5.
 * - `magnitude` — B-channel profile over corner-normalized radius `r∈[0,1]`:
 *   `"constant"` (1 everywhere, default), `"linear"` (`r`, grows outward),
 *   `"falloff"` (`1−r`, decays outward — bounds a twirl so corners stay put).
 *
 * @param props
 * @category Generative
 */
export function VectorField({
	width,
	height,
	pattern,
	angle = 0,
	centerX = 0.5,
	centerY = 0.5,
	magnitude = "constant",
}: {
	width: number
	height: number
	pattern: VectorFieldPattern
	angle?: number
	centerX?: number
	centerY?: number
	magnitude?: MagnitudeProfile
}) {
	const draw = useCallback(
		(canvas: HTMLCanvasElement) => {
			const context = canvas.getContext("2d")

			if (!context) return

			context.putImageData(
				buildVectorField(width, height, pattern, { angle, centerX, centerY, magnitude }),
				0,
				0,
			)
		},
		[width, height, pattern, angle, centerX, centerY, magnitude],
	)

	return <RasterSource width={width} height={height} draw={draw} />
}
