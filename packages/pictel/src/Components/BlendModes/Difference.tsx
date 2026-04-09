import type { ComponentProps } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../Pipeline/RasterBlend"

export const difference: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	Math.abs(sr - dr),
	Math.abs(sg - dg),
	Math.abs(sb - db),
]

interface DifferenceProps extends ComponentProps<"div"> {
	opacity?: number
	flatten?: boolean
}

/**
 * Subtracts the darker color from the lighter for each channel.
 * Identical layers produce black; useful for comparing or creating inverted effects.
 *
 * @param props
 * @category Blend Modes
 */
export function Difference({ opacity, flatten, ...rest }: DifferenceProps) {
	return (
		<RasterBlend blend={difference} opacity={opacity} flatten={flatten} {...rest} />
	)
}
