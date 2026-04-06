import type { ComponentPropsWithoutRef } from "react"
import { useEffect, useRef } from "react"
import type { GradientStop } from "./LinearGradient"
import { useContainerSize } from "../../hooks/useContainerSize"

interface ConicGradientProps extends ComponentPropsWithoutRef<"div"> {
	stops: Array<GradientStop>
	centerX?: number
	centerY?: number
	startAngle?: number
}

export function drawConicGradient(
	context: CanvasRenderingContext2D,
	width: number,
	height: number,
	stops: Array<GradientStop>,
	centerX: number,
	centerY: number,
	startAngle: number,
): void {
	const pixelCenterX = centerX * width
	const pixelCenterY = centerY * height
	const startRad = (startAngle * Math.PI) / 180

	const gradient = context.createConicGradient(
		startRad,
		pixelCenterX,
		pixelCenterY,
	)

	for (const stop of stops) {
		gradient.addColorStop(stop.position, stop.color)
	}

	context.fillStyle = gradient
	context.fillRect(0, 0, width, height)
}

export function ConicGradient({
	stops,
	centerX = 0.5,
	centerY = 0.5,
	startAngle = 0,
	style,
	...rest
}: ConicGradientProps) {
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

		drawConicGradient(context, width, height, stops, centerX, centerY, startAngle)
		 
	}, [width, height, stopsKey, centerX, centerY, startAngle])

	return (
		<div ref={ref} style={{ width: "100%", height: "100%", ...style }} {...rest}>
			<canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
		</div>
	)
}
