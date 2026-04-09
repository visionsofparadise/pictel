import type { ComponentProps } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { colorDodge as colorDodgeChannel } from "./utils/color-dodge"
import { RasterBlend } from "../Pipeline/RasterBlend"

export const colorDodge: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	colorDodgeChannel(dr, sr),
	colorDodgeChannel(dg, sg),
	colorDodgeChannel(db, sb),
]

interface ColorDodgeProps extends ComponentProps<"div"> {
	opacity?: number
	flatten?: boolean
}

/**
 * Brightens the base by decreasing contrast relative to the blend layer.
 * Produces lighter highlights than Screen with more vivid color shifts.
 *
 * @param props
 * @category Blend Modes
 */
export function ColorDodge({ opacity, flatten, ...rest }: ColorDodgeProps) {
	return (
		<RasterBlend blend={colorDodge} opacity={opacity} flatten={flatten} {...rest} />
	)
}
