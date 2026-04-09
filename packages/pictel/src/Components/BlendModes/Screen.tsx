import type { ComponentProps } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../Pipeline/RasterBlend"

export const screen: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	sr + dr - sr * dr,
	sg + dg - sg * dg,
	sb + db - sb * db,
]

interface ScreenProps extends ComponentProps<"div"> {
	opacity?: number
	flatten?: boolean
}

/**
 * Multiplies the inverse of base and blend, producing lighter results.
 * Black is transparent; white produces white. Standard lightening mode.
 *
 * @param props
 * @category Blend Modes
 */
export function Screen({ opacity, flatten, ...rest }: ScreenProps) {
	return (
		<RasterBlend blend={screen} opacity={opacity} flatten={flatten} {...rest} />
	)
}
