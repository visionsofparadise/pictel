import type { ComponentProps } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../RasterBlend"

export const exclusion: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	sr + dr - 2 * sr * dr,
	sg + dg - 2 * sg * dg,
	sb + db - 2 * sb * db,
]

interface ExclusionProps extends ComponentProps<"div"> {
	opacity?: number
	flatten?: boolean
}

/**
 * Similar to Difference but with lower contrast. Produces a softer inversion effect.
 * Blending with white inverts the base; blending with black has no effect.
 *
 * @param props
 * @category Blend Modes
 */
export function Exclusion({ opacity, flatten, ...rest }: ExclusionProps) {
	return (
		<RasterBlend blend={exclusion} opacity={opacity} flatten={flatten} {...rest} />
	)
}
