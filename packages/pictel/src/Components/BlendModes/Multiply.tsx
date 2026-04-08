import type { ComponentProps } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../RasterBlend"

export const multiply: BlendFormula = (sr, sg, sb, dr, dg, db) => [sr * dr, sg * dg, sb * db]

interface MultiplyProps extends ComponentProps<"div"> {
	opacity?: number
	flatten?: boolean
}

/**
 * Multiplies base and blend values per channel, producing darker results.
 * White is transparent; black produces black. Standard darkening mode.
 *
 * @param props
 * @category Blend Modes
 */
export function Multiply({ opacity, flatten, ...rest }: MultiplyProps) {
	return (
		<RasterBlend blend={multiply} opacity={opacity} flatten={flatten} {...rest} />
	)
}
