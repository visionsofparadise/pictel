import type { ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../Pipeline/RasterBlend"

export const darken: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	Math.min(sr, dr),
	Math.min(sg, dg),
	Math.min(sb, db),
]

interface DarkenProps {
	opacity?: number
	flatten?: boolean
	children: ReactNode
}

/**
 * Keeps the darker of the base or blend value for each channel.
 * Useful for removing white backgrounds or combining dark elements.
 *
 * @param props
 * @category Blend Modes
 */
export function Darken({ opacity, flatten, children }: DarkenProps) {
	return (
		<RasterBlend blend={darken} opacity={opacity} flatten={flatten}>
			{children}
		</RasterBlend>
	)
}
