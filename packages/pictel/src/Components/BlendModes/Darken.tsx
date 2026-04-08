import type { ComponentProps } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../RasterBlend"

export const darken: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	Math.min(sr, dr),
	Math.min(sg, dg),
	Math.min(sb, db),
]

interface DarkenProps extends ComponentProps<"div"> {
	opacity?: number
	flatten?: boolean
}

/**
 * Keeps the darker of the base or blend value for each channel.
 * Useful for removing white backgrounds or combining dark elements.
 *
 * @param props
 * @category Blend Modes
 */
export function Darken({ opacity, flatten, ...rest }: DarkenProps) {
	return (
		<RasterBlend blend={darken} opacity={opacity} flatten={flatten} {...rest} />
	)
}
