import type { ComponentProps } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../RasterBlend"

export const lighten: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	Math.max(sr, dr),
	Math.max(sg, dg),
	Math.max(sb, db),
]

interface LightenProps extends ComponentProps<"div"> {
	opacity?: number
	flatten?: boolean
}

/**
 * Keeps the lighter of the base or blend value for each channel.
 * Useful for removing black backgrounds or combining light elements.
 *
 * @param props
 * @category Blend Modes
 */
export function Lighten({ opacity, flatten, ...rest }: LightenProps) {
	return (
		<RasterBlend blend={lighten} opacity={opacity} flatten={flatten} {...rest} />
	)
}
