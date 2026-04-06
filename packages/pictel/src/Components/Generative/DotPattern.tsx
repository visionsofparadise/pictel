import type { ComponentPropsWithoutRef } from "react"
import { useEffect, useRef } from "react"
import { useContainerSize } from "../../hooks/useContainerSize"

interface DotPatternProps extends ComponentPropsWithoutRef<"div"> {
	seed: number
	spacing: number
	radius: number
	color: string
	background?: string
}

/** Draw filled circles on a regular grid. */
export function drawDotPattern(
	context: CanvasRenderingContext2D,
	width: number,
	height: number,
	props: Pick<DotPatternProps, "spacing" | "radius" | "color" | "background">,
) {
	if (props.background) {
		context.fillStyle = props.background
		context.fillRect(0, 0, width, height)
	}

	context.fillStyle = props.color

	for (let px = props.spacing / 2; px < width + props.spacing; px += props.spacing) {
		for (let py = props.spacing / 2; py < height + props.spacing; py += props.spacing) {
			context.beginPath()
			context.arc(px, py, props.radius, 0, Math.PI * 2)
			context.fill()
		}
	}
}

export function DotPattern({
	seed: _seed,
	spacing,
	radius,
	color,
	background,
	style,
	...rest
}: DotPatternProps) {
	const { ref, width, height } = useContainerSize()
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		const canvas = canvasRef.current

		if (!canvas || width === 0 || height === 0) return

		canvas.width = width
		canvas.height = height

		const context = canvas.getContext("2d")

		if (!context) return

		drawDotPattern(context, width, height, { spacing, radius, color, background })
	}, [width, height, _seed, spacing, radius, color, background])

	return (
		<div ref={ref} style={{ width: "100%", height: "100%", ...style }} {...rest}>
			<canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
		</div>
	)
}
