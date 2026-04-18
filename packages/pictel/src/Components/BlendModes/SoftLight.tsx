import type { ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../Pipeline/RasterBlend"

function softLightD(x: number): number {
	return x <= 0.25 ? ((16 * x - 12) * x + 4) * x : Math.sqrt(x)
}

function softLightChannel(sr: number, dr: number): number {
	return sr <= 0.5
		? dr - (1 - 2 * sr) * dr * (1 - dr)
		: dr + (2 * sr - 1) * (softLightD(dr) - dr)
}

export const softLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	softLightChannel(sr, dr),
	softLightChannel(sg, dg),
	softLightChannel(sb, db),
]

interface SoftLightProps {
	opacity?: number
	children: ReactNode
}

/**
 * Gently darkens or lightens depending on the blend value.
 * Like shining a diffused light on the base. Subtler than Overlay or Hard Light.
 *
 * @param props
 * @category Blend Modes
 */
export function SoftLight({ opacity, children }: SoftLightProps) {
	return (
		<RasterBlend blend={softLight} opacity={opacity}>
			{children}
		</RasterBlend>
	)
}
