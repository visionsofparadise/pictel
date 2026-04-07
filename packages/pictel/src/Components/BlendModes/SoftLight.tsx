import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../RasterBlend"

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

interface SoftLightProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	flatten?: boolean
	children?: ReactNode
}

export function SoftLight({ opacity, flatten, children, ...rest }: SoftLightProps) {
	return (
		<RasterBlend blend={softLight} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	)
}
