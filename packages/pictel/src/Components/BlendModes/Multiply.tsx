import type { ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../Pipeline/RasterBlend"

export const multiply: BlendFormula = (sr, sg, sb, dr, dg, db) => [sr * dr, sg * dg, sb * db]

interface MultiplyProps {
	opacity?: number
	children: ReactNode
}

/**
 * Multiplies base and blend values per channel, producing darker results.
 * White is transparent; black produces black. Standard darkening mode.
 *
 * @param props
 * @category Blend Modes
 */
export function Multiply({ opacity, children }: MultiplyProps) {
	return (
		<RasterBlend blend={multiply} opacity={opacity}>
			{children}
		</RasterBlend>
	)
}
