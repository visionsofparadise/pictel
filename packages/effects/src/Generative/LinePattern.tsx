import { useCallback } from "react"
import { RasterSource } from "pictel"

interface LinePatternProps {
	/** Output width in pixels. Required — generatives produce pixels at intrinsic dimensions. */
	width: number
	/** Output height in pixels. Required — generatives produce pixels at intrinsic dimensions. */
	height: number
	/** Random seed (reserved for future jitter support). */
	seed: number
	/** Distance between lines in pixels. */
	spacing: number
	/** Line thickness in pixels. */
	thickness: number
	/** Line angle in degrees. 0 is horizontal. Default 0. */
	angle?: number
	/** Line color. */
	color: string
	/** Optional background fill color. */
	background?: string
}

export function drawLinePattern(
	context: CanvasRenderingContext2D,
	width: number,
	height: number,
	props: Pick<LinePatternProps, "spacing" | "thickness" | "angle" | "color" | "background">,
) {
	const angleInDegrees = props.angle ?? 0

	if (props.background) {
		context.fillStyle = props.background
		context.fillRect(0, 0, width, height)
	}

	const radians = (angleInDegrees * Math.PI) / 180
	const diagonal = Math.sqrt(width * width + height * height)

	context.strokeStyle = props.color
	context.lineWidth = props.thickness

	context.save()
	context.translate(width / 2, height / 2)
	context.rotate(radians)

	const count = Math.ceil(diagonal / props.spacing) + 1
	const start = -(count * props.spacing) / 2

	for (let lineIndex = 0; lineIndex <= count; lineIndex++) {
		const offset = start + lineIndex * props.spacing

		context.beginPath()
		context.moveTo(-diagonal / 2, offset)
		context.lineTo(diagonal / 2, offset)
		context.stroke()
	}

	context.restore()
}

/**
 * Renders a repeating pattern of parallel lines at a configurable angle, at intrinsic dimensions.
 *
 * Produces pixels at intrinsic dimensions like an `<img>`: the host/agent specifies
 * `width` and `height` explicitly. The component does not respond to its container's
 * size. Wrap in a styled div if positioning is needed.
 *
 * - `width` — Output width in pixels. Required.
 * - `height` — Output height in pixels. Required.
 * - `seed` — Random seed (reserved for future jitter support).
 * - `spacing` — Distance between lines in pixels.
 * - `thickness` — Line thickness in pixels.
 * - `angle` — Line angle in degrees. 0 is horizontal. Default 0.
 * - `color` — Line color.
 * - `background` — Optional background fill color.
 *
 * @param props
 * @category Generative
 */
export function LinePattern({
	width,
	height,
	seed: _seed,
	spacing,
	thickness,
	angle = 0,
	color,
	background,
}: LinePatternProps) {
	const draw = useCallback(
		(canvas: HTMLCanvasElement) => {
			const context = canvas.getContext("2d")

			if (!context) return

			drawLinePattern(context, width, height, { spacing, thickness, angle, color, background })
		},
		[width, height, _seed, spacing, thickness, angle, color, background],
	)

	return <RasterSource width={width} height={height} draw={draw} />
}
