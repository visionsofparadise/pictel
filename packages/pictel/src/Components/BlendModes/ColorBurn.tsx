import type { ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { colorBurn as colorBurnChannel } from "./utils/color-burn"
import { RasterBlend } from "../Pipeline/RasterBlend"

export const colorBurn: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	colorBurnChannel(dr, sr),
	colorBurnChannel(dg, sg),
	colorBurnChannel(db, sb),
]

interface ColorBurnProps {
	opacity?: number
	children: ReactNode
}

/**
 * Darkens the base by increasing contrast relative to the blend layer.
 * Produces deeper shadows than Multiply with more saturated mid-tones.
 *
 * @param props
 * @category Blend Modes
 */
export function ColorBurn({ opacity, children }: ColorBurnProps) {
	return (
		<RasterBlend blend={colorBurn} opacity={opacity}>
			{children}
		</RasterBlend>
	)
}
