import type { ComponentPropsWithoutRef } from "react"
import { useEffect, useRef } from "react"
import type { GradientStop } from "./LinearGradient"
import { useContainerSize } from "../../hooks/useContainerSize"

interface RadialGradientProps extends ComponentPropsWithoutRef<"div"> {
	stops: Array<GradientStop>
	centerX?: number
	centerY?: number
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

export function RadialGradient({
	stops,
	centerX = 0.5,
	centerY = 0.5,
	radius = 0.5,
	style,
	...rest
}: RadialGradientProps) {
	const { ref, width, height } = useContainerSize()
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
		<div ref={ref} style={{ width: "100%", height: "100%", ...style }} {...rest}>
			<canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
		</div>
	)
}
