import type { ComponentProps } from "react"
import { useEffect, useRef } from "react"

interface GridPatternProps extends ComponentProps<"div"> {
	/** Output width in pixels. Required — generatives produce pixels at intrinsic dimensions. */
	width: number
	/** Output height in pixels. Required — generatives produce pixels at intrinsic dimensions. */
	height: number
	/** Random seed (reserved for future jitter support). */
	seed: number
	/** Horizontal spacing between vertical lines in pixels. */
	spacingX: number
	/** Vertical spacing between horizontal lines. Defaults to `spacingX`. */
	spacingY?: number
	/** Line thickness in pixels. */
	thickness: number
	/** Line color. */
	color: string
	/** Optional background fill color. */
	background?: string
}

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

/**
 * Renders a repeating grid of horizontal and vertical lines, at intrinsic dimensions.
 *
 * Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
 * `width` and `height` explicitly. The component does not respond to its container's
 * size — the host CSS positions or scales the natural pixel footprint visually if needed.
 *
 * - `width` — Output width in pixels. Required.
 * - `height` — Output height in pixels. Required.
 * - `seed` — Random seed (reserved for future jitter support).
 * - `spacingX` — Horizontal spacing between vertical lines in pixels.
 * - `spacingY` — Vertical spacing between horizontal lines. Defaults to `spacingX`.
 * - `thickness` — Line thickness in pixels.
 * - `color` — Line color.
 * - `background` — Optional background fill color.
 *
 * @param props
 * @category Generative
 */
export function GridPattern({
	width,
	height,
	seed: _seed,
	spacingX,
	spacingY,
	thickness,
	color,
	background,
	style,
	...rest
}: GridPatternProps) {
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
		<div style={{ width, height, ...style }} {...rest}>
			<canvas ref={canvasRef} width={width} height={height} style={{ width, height, display: "block" }} />
		</div>
	)
}
