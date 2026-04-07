import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../RasterBlend"

function hardLightChannel(sr: number, dr: number): number {
	return sr <= 0.5 ? 2 * sr * dr : 1 - 2 * (1 - sr) * (1 - dr)
}

export const hardLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	hardLightChannel(sr, dr),
	hardLightChannel(sg, dg),
	hardLightChannel(sb, db),
]

interface HardLightProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	flatten?: boolean
	children?: ReactNode
}

export function HardLight({ opacity, flatten, children, ...rest }: HardLightProps) {
	return (
		<RasterBlend blend={hardLight} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	)
}
