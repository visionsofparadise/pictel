import { useCallback } from "react"
import { RasterSource } from "pictel"

interface DotPatternProps {
	width: number
	height: number
	seed: number
	spacing: number
	radius: number
	color: string
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
 * size. Wrap in a styled div if positioning is needed.
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
}: DotPatternProps) {
	const draw = useCallback(
		(canvas: HTMLCanvasElement) => {
			const context = canvas.getContext("2d")

			if (!context) return

			drawDotPattern(context, width, height, { spacing, radius, color, background })
		},
		[width, height, _seed, spacing, radius, color, background],
	)

	return <RasterSource width={width} height={height} draw={draw} />
}
