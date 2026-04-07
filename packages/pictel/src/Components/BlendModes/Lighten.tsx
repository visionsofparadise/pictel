import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../RasterBlend"

export const lighten: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	Math.max(sr, dr),
	Math.max(sg, dg),
	Math.max(sb, db),
]

interface LightenProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	flatten?: boolean
	children?: ReactNode
}

export function Lighten({ opacity, flatten, children, ...rest }: LightenProps) {
	return (
		<RasterBlend blend={lighten} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	)
}
