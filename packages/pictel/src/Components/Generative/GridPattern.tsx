import type { ComponentPropsWithoutRef } from "react"
import { useEffect, useRef } from "react"
import { useContainerSize } from "../../hooks/useContainerSize"

interface GridPatternProps extends ComponentPropsWithoutRef<"div"> {
	seed: number
	spacingX: number
	spacingY?: number
	thickness: number
	color: string
	background?: string
}

/** Draw vertical and horizontal grid lines. */
export function drawGridPattern(
	context: CanvasRenderingContext2D,
	width: number,
	height: number,
	props: Pick<GridPatternProps, "spacingX" | "spacingY" | "thickness" | "color" | "background">,
) {
	const resolvedSpacingY = props.spacingY ?? props.spacingX

	if (props.background) {
		context.fillStyle = props.background
		context.fillRect(0, 0, width, height)
	}

	context.strokeStyle = props.color
	context.lineWidth = props.thickness

	for (let px = 0; px <= width; px += props.spacingX) {
		context.beginPath()
		context.moveTo(px, 0)
		context.lineTo(px, height)
		context.stroke()
	}

	for (let py = 0; py <= height; py += resolvedSpacingY) {
		context.beginPath()
		context.moveTo(0, py)
		context.lineTo(width, py)
		context.stroke()
	}
}

export function GridPattern({
	seed: _seed,
	spacingX,
	spacingY,
	thickness,
	color,
	background,
	style,
	...rest
}: GridPatternProps) {
	const { ref, width, height } = useContainerSize()
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const resolvedSpacingY = spacingY ?? spacingX

	useEffect(() => {
		const canvas = canvasRef.current

		if (!canvas || width === 0 || height === 0) return

		canvas.width = width
		canvas.height = height

		const context = canvas.getContext("2d")

		if (!context) return

		drawGridPattern(context, width, height, { spacingX, spacingY, thickness, color, background })
	}, [width, height, _seed, spacingX, resolvedSpacingY, thickness, color, background])

	return (
		<div ref={ref} style={{ width: "100%", height: "100%", ...style }} {...rest}>
			<canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
		</div>
	)
}
