import type { ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../Pipeline/RasterBlend"

function overlayChannel(sr: number, dr: number): number {
	return dr <= 0.5 ? 2 * sr * dr : 1 - 2 * (1 - sr) * (1 - dr)
}

export const overlay: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	overlayChannel(sr, dr),
	overlayChannel(sg, dg),
	overlayChannel(sb, db),
]

interface OverlayProps {
	opacity?: number
	flatten?: boolean
	children: ReactNode
}

/**
 * Multiplies dark base values and screens light base values.
 * Increases contrast while preserving highlights and shadows. Most common contrast blend mode.
 *
 * @param props
 * @category Blend Modes
 */
export function Overlay({ opacity, flatten, children }: OverlayProps) {
	return (
		<RasterBlend blend={overlay} opacity={opacity} flatten={flatten}>
			{children}
		</RasterBlend>
	)
}
