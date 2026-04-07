import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { colorBurn as colorBurnChannel } from "./utils/color-burn"
import { RasterBlend } from "../RasterBlend"

export const colorBurn: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	colorBurnChannel(dr, sr),
	colorBurnChannel(dg, sg),
	colorBurnChannel(db, sb),
]

interface ColorBurnProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	flatten?: boolean
	children?: ReactNode
}

export function ColorBurn({ opacity, flatten, children, ...rest }: ColorBurnProps) {
	return (
		<RasterBlend blend={colorBurn} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	)
}
