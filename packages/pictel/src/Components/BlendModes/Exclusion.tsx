import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../RasterBlend"

export const exclusion: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	sr + dr - 2 * sr * dr,
	sg + dg - 2 * sg * dg,
	sb + db - 2 * sb * db,
]

interface ExclusionProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	flatten?: boolean
	children?: ReactNode
}

export function Exclusion({ opacity, flatten, children, ...rest }: ExclusionProps) {
	return (
		<RasterBlend blend={exclusion} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	)
}
