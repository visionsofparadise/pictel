import type { ComponentProps } from "react"
import { useEffect, useRef } from "react"

interface DotPatternProps extends ComponentProps<"div"> {
	/** Output width in pixels. Required — generatives produce pixels at intrinsic dimensions. */
	width: number
	/** Output height in pixels. Required — generatives produce pixels at intrinsic dimensions. */
	height: number
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
 * Renders a repeating dot pattern on a regular grid, at intrinsic dimensions.
 *
 * Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
 * `width` and `height` explicitly. The component does not respond to its container's
 * size — the host CSS positions or scales the natural pixel footprint visually if needed.
 *
 * - `width` — Output width in pixels. Required.
 * - `height` — Output height in pixels. Required.
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
	width,
	height,
	seed: _seed,
	spacing,
	radius,
	color,
	background,
	style,
	...rest
}: DotPatternProps) {
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
		<div style={{ width, height, ...style }} {...rest}>
			<canvas ref={canvasRef} width={width} height={height} style={{ width, height, display: "block" }} />
		</div>
	)
}
