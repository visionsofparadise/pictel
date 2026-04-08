import type { ComponentProps } from "react"
import { useEffect, useRef } from "react"
import { useContainerSize } from "../../hooks/useContainerSize"

interface DotPatternProps extends ComponentProps<"div"> {
	/** Random seed (reserved for future jitter support). */
	seed: number
	/** Distance between dot centers in pixels. */
	spacing: number
	/** Dot radius in pixels. */
	radius: number
	/** Dot fill color. */
	color: string
	/** Optional background fill color. */
	background?: string
}

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

/**
 * Renders a repeating dot pattern on a regular grid.
 *
 * - `seed` — Random seed (reserved for future jitter support).
 * - `spacing` — Distance between dot centers in pixels.
 * - `radius` — Dot radius in pixels.
 * - `color` — Dot fill color.
 * - `background` — Optional background fill color.
 *
 * @param props
 * @category Generative
 */
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
