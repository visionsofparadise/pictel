import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { colorDodge as colorDodgeChannel } from "./utils/color-dodge"
import { RasterBlend } from "../RasterBlend"

export const colorDodge: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	colorDodgeChannel(dr, sr),
	colorDodgeChannel(dg, sg),
	colorDodgeChannel(db, sb),
]

interface ColorDodgeProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	flatten?: boolean
	children?: ReactNode
}

export function ColorDodge({ opacity, flatten, children, ...rest }: ColorDodgeProps) {
	return (
		<RasterBlend blend={colorDodge} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	)
}
