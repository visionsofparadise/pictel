import type { ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../Pipeline/RasterBlend"

export const lighten: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	Math.max(sr, dr),
	Math.max(sg, dg),
	Math.max(sb, db),
]

interface LightenProps {
	opacity?: number
	flatten?: boolean
	children: ReactNode
}

/**
 * Keeps the lighter of the base or blend value for each channel.
 * Useful for removing black backgrounds or combining light elements.
 *
 * @param props
 * @category Blend Modes
 */
export function Lighten({ opacity, flatten, children }: LightenProps) {
	return (
		<RasterBlend blend={lighten} opacity={opacity} flatten={flatten}>
			{children}
		</RasterBlend>
	)
}
