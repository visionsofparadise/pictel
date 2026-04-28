import type { ComponentProps } from "react"
import { useEffect, useRef } from "react"

export interface GradientStop {
	color: string
	position: number
}

interface LinearGradientProps extends ComponentProps<"div"> {
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
 * size — the host CSS positions or scales the natural pixel footprint visually if needed.
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
	style,
	...rest
}: LinearGradientProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const stopsKey = JSON.stringify(stops)

	useEffect(() => {
		const canvas = canvasRef.current

		if (!canvas || width === 0 || height === 0) return

		canvas.width = width
		canvas.height = height

		const context = canvas.getContext("2d")

		if (!context) return

		drawLinearGradient(context, width, height, stops, angle)

	}, [width, height, stopsKey, angle])

	return (
		<div style={{ width, height, ...style }} {...rest}>
			<canvas ref={canvasRef} width={width} height={height} style={{ width, height, display: "block" }} />
		</div>
	)
}
