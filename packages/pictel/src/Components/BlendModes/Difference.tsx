import type { ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../Pipeline/RasterBlend"

export const difference: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	Math.abs(sr - dr),
	Math.abs(sg - dg),
	Math.abs(sb - db),
]

interface DifferenceProps {
	opacity?: number
	flatten?: boolean
	children: ReactNode
}

/**
 * Subtracts the darker color from the lighter for each channel.
 * Identical layers produce black; useful for comparing or creating inverted effects.
 *
 * @param props
 * @category Blend Modes
 */
export function Difference({ opacity, flatten, children }: DifferenceProps) {
	return (
		<RasterBlend blend={difference} opacity={opacity} flatten={flatten}>
			{children}
		</RasterBlend>
	)
}
