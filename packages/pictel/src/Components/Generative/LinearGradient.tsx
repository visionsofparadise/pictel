import type { ComponentPropsWithoutRef } from "react"
import { useEffect, useRef } from "react"
import { useContainerSize } from "../../hooks/useContainerSize"

export interface GradientStop {
	color: string
	position: number
}

interface LinearGradientProps extends ComponentPropsWithoutRef<"div"> {
	stops: Array<GradientStop>
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

export function LinearGradient({
	stops,
	angle = 0,
	style,
	...rest
}: LinearGradientProps) {
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

		drawLinearGradient(context, width, height, stops, angle)
		 
	}, [width, height, stopsKey, angle])

	return (
		<div ref={ref} style={{ width: "100%", height: "100%", ...style }} {...rest}>
			<canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
		</div>
	)
}
