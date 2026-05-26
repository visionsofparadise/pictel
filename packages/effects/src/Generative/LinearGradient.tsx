/* eslint-disable react-hooks/preserve-manual-memoization -- The `stops` array
 * may be passed as an inline JSX literal (fresh identity each render). We use
 * `stopsKey` (a serialized content hash) in deps so `draw` stays referentially
 * stable. React Compiler infers `stops` as the dep and flags this; the
 * substitution is intentional. */
import { useCallback } from "react"
import { RasterSource } from "pictel"

export interface GradientStop {
	color: string
	position: number
}

interface LinearGradientProps {
	/** Output width in pixels. Required — generatives produce pixels at intrinsic dimensions. */
	width: number
	/** Output height in pixels. Required — generatives produce pixels at intrinsic dimensions. */
	height: number
	/** Array of color stops with `color` and `position` (0-1). */
	stops: Array<GradientStop>
	/** Gradient angle in degrees. 0 is left-to-right. Default 0. */
	angle?: number
}

export function drawLinearGradient(
	context: CanvasRenderingContext2D,
	width: number,
	height: number,
	stops: Array<GradientStop>,
	angle: number,
): void {
	const rad = (angle * Math.PI) / 180
	const centerX = width / 2
	const centerY = height / 2

	const directionX = Math.cos(rad)
	const directionY = Math.sin(rad)
	const halfLength =
		(Math.abs(width * directionX) + Math.abs(height * directionY)) / 2

	const startX = centerX - directionX * halfLength
	const startY = centerY - directionY * halfLength
	const endX = centerX + directionX * halfLength
	const endY = centerY + directionY * halfLength

	const gradient = context.createLinearGradient(startX, startY, endX, endY)

	for (const stop of stops) {
		gradient.addColorStop(stop.position, stop.color)
	}

	context.fillStyle = gradient
	context.fillRect(0, 0, width, height)
}

/**
 * Renders a linear gradient at intrinsic dimensions.
 *
 * Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
 * `width` and `height` explicitly. The component does not respond to its container's
 * size. Wrap in a styled div if positioning is needed.
 *
 * - `width` — Output width in pixels. Required.
 * - `height` — Output height in pixels. Required.
 * - `stops` — Array of color stops with `color` and `position` (0-1).
 * - `angle` — Gradient angle in degrees. 0 is left-to-right. Default 0.
 *
 * @param props
 * @category Generative
 */
export function LinearGradient({
	width,
	height,
	stops,
	angle = 0,
}: LinearGradientProps) {
	// Content-based key keeps `draw` referentially stable when callers pass
	// inline `stops` array literals (fresh identity each render). Without this
	// the leaf's useLayoutEffect would re-acquire pending every parent render.
	const stopsKey = stops.map((stop) => `${stop.color}@${String(stop.position)}`).join("|")

	 
	const draw = useCallback(
		(canvas: HTMLCanvasElement) => {
			const context = canvas.getContext("2d")

			if (!context) return

			drawLinearGradient(context, width, height, stops, angle)
		},
		[width, height, stopsKey, angle],
	)

	return <RasterSource width={width} height={height} draw={draw} />
}
