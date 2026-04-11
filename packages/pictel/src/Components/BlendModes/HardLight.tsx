import type { ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../Pipeline/RasterBlend"

function hardLightChannel(sr: number, dr: number): number {
	return sr <= 0.5 ? 2 * sr * dr : 1 - 2 * (1 - sr) * (1 - dr)
}

export const hardLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	hardLightChannel(sr, dr),
	hardLightChannel(sg, dg),
	hardLightChannel(sb, db),
]

interface HardLightProps {
	opacity?: number
	flatten?: boolean
	children: ReactNode
}

/**
 * Multiplies dark blend values and screens light blend values.
 * Like shining a harsh light on the base layer. Inverse of Overlay.
 *
 * @param props
 * @category Blend Modes
 */
export function HardLight({ opacity, flatten, children }: HardLightProps) {
	return (
		<RasterBlend blend={hardLight} opacity={opacity} flatten={flatten}>
			{children}
		</RasterBlend>
	)
}
