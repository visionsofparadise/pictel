import type { ComponentProps } from "react"
import { useEffect, useRef } from "react"
import type { GradientStop } from "./LinearGradient"

interface RadialGradientProps extends ComponentProps<"div"> {
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
 * size — the host CSS positions or scales the natural pixel footprint visually if needed.
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
	style,
	...rest
}: RadialGradientProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const stopsKey = JSON.stringify(stops)

	useEffect(() => {
		const canvas = canvasRef.current

		if (!canvas || width === 0 || height === 0) return

		canvas.width = width
		canvas.height = height

		const context = canvas.getContext("2d")

		if (!context) return

		drawRadialGradient(context, width, height, stops, centerX, centerY, radius)

	}, [width, height, stopsKey, centerX, centerY, radius])

	return (
		<div style={{ width, height, ...style }} {...rest}>
			<canvas ref={canvasRef} width={width} height={height} style={{ width, height, display: "block" }} />
		</div>
	)
}
