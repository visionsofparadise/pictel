import type { ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../Pipeline/RasterBlend"

export const exclusion: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	sr + dr - 2 * sr * dr,
	sg + dg - 2 * sg * dg,
	sb + db - 2 * sb * db,
]

interface ExclusionProps {
	opacity?: number
	flatten?: boolean
	children: ReactNode
}

/**
 * Similar to Difference but with lower contrast. Produces a softer inversion effect.
 * Blending with white inverts the base; blending with black has no effect.
 *
 * @param props
 * @category Blend Modes
 */
export function Exclusion({ opacity, flatten, children }: ExclusionProps) {
	return (
		<RasterBlend blend={exclusion} opacity={opacity} flatten={flatten}>
			{children}
		</RasterBlend>
	)
}
