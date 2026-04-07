import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../RasterBlend"

export const multiply: BlendFormula = (sr, sg, sb, dr, dg, db) => [sr * dr, sg * dg, sb * db]

interface MultiplyProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	flatten?: boolean
	children?: ReactNode
}

export function Multiply({ opacity, flatten, children, ...rest }: MultiplyProps) {
	return (
		<RasterBlend blend={multiply} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	)
}
