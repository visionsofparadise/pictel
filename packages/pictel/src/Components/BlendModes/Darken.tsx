import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../RasterBlend"

export const darken: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	Math.min(sr, dr),
	Math.min(sg, dg),
	Math.min(sb, db),
]

interface DarkenProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	flatten?: boolean
	children?: ReactNode
}

export function Darken({ opacity, flatten, children, ...rest }: DarkenProps) {
	return (
		<RasterBlend blend={darken} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	)
}
