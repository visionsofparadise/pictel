import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../RasterBlend"

export const screen: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	sr + dr - sr * dr,
	sg + dg - sg * dg,
	sb + db - sb * db,
]

interface ScreenProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	flatten?: boolean
	children?: ReactNode
}

export function Screen({ opacity, flatten, children, ...rest }: ScreenProps) {
	return (
		<RasterBlend blend={screen} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	)
}
