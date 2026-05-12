/* eslint-disable react-hooks/preserve-manual-memoization -- The `stops` array
 * may be passed as an inline JSX literal (fresh identity each render). We use
 * `stopsKey` (a serialized content hash) in deps so `draw` stays referentially
 * stable. React Compiler infers `stops` as the dep and flags this; the
 * substitution is intentional. */
import { useCallback } from "react"
import { RasterSource } from "../Pipeline/RasterSource"
import type { GradientStop } from "./LinearGradient"

interface RadialGradientProps {
	/** Output width in pixels. Required — generatives produce pixels at intrinsic dimensions. */
	width: number
	/** Output height in pixels. Required — generatives produce pixels at intrinsic dimensions. */
	height: number
	/** Array of color stops with `color` and `position` (0-1). */
	stops: Array<GradientStop>
	/** Horizontal center as a fraction of width. Default 0.5. */
	centerX?: number
	/** Vertical center as a fraction of height. Default 0.5. */
	centerY?: number
	/** Gradient radius as a fraction of the smaller dimension. Default 0.5. */
	radius?: number
}

export function drawRadialGradient(
	context: CanvasRenderingContext2D,
	width: number,
	height: number,
	stops: Array<GradientStop>,
	centerX: number,
	centerY: number,
	radius: number,
): void {
	const pixelCenterX = centerX * width
	const pixelCenterY = centerY * height
	const pixelRadius = radius * Math.min(width, height)

	const gradient = context.createRadialGradient(
		pixelCenterX,
		pixelCenterY,
		0,
		pixelCenterX,
		pixelCenterY,
		pixelRadius,
	)

	for (const stop of stops) {
		gradient.addColorStop(stop.position, stop.color)
	}

	context.fillStyle = gradient
	context.fillRect(0, 0, width, height)
}

/**
 * Renders a radial gradient radiating from a center point at intrinsic dimensions.
 *
 * Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
 * `width` and `height` explicitly. The component does not respond to its container's
 * size. Wrap in a styled div if positioning is needed.
 *
 * - `width` — Output width in pixels. Required.
 * - `height` — Output height in pixels. Required.
 * - `stops` — Array of color stops with `color` and `position` (0-1).
 * - `centerX` — Horizontal center as a fraction of width. Default 0.5.
 * - `centerY` — Vertical center as a fraction of height. Default 0.5.
 * - `radius` — Gradient radius as a fraction of the smaller dimension. Default 0.5.
 *
 * @param props
 * @category Generative
 */
export function RadialGradient({
	width,
	height,
	stops,
	centerX = 0.5,
	centerY = 0.5,
	radius = 0.5,
}: RadialGradientProps) {
	// Content-based key keeps `draw` referentially stable when callers pass
	// inline `stops` array literals (fresh identity each render). Without this
	// the leaf's useLayoutEffect would re-acquire pending every parent render.
	const stopsKey = stops.map((stop) => `${stop.color}@${String(stop.position)}`).join("|")

	 
	const draw = useCallback(
		(canvas: HTMLCanvasElement) => {
			const context = canvas.getContext("2d")

			if (!context) return

			drawRadialGradient(context, width, height, stops, centerX, centerY, radius)
		},
		[width, height, stopsKey, centerX, centerY, radius],
	)

	return <RasterSource width={width} height={height} draw={draw} />
}
