import type { ComponentProps } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { colorBurn as colorBurnChannel } from "./utils/color-burn"
import { RasterBlend } from "../Pipeline/RasterBlend"

export const colorBurn: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	colorBurnChannel(dr, sr),
	colorBurnChannel(dg, sg),
	colorBurnChannel(db, sb),
]

interface ColorBurnProps extends ComponentProps<"div"> {
	opacity?: number
	flatten?: boolean
}

/**
 * Darkens the base by increasing contrast relative to the blend layer.
 * Produces deeper shadows than Multiply with more saturated mid-tones.
 *
 * @param props
 * @category Blend Modes
 */
export function ColorBurn({ opacity, flatten, ...rest }: ColorBurnProps) {
	return (
		<RasterBlend blend={colorBurn} opacity={opacity} flatten={flatten} {...rest} />
	)
}
