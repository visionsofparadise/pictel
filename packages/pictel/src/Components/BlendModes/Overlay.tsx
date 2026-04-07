import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { RasterBlend } from "../RasterBlend"

function overlayChannel(sr: number, dr: number): number {
	return dr <= 0.5 ? 2 * sr * dr : 1 - 2 * (1 - sr) * (1 - dr)
}

export const overlay: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	overlayChannel(sr, dr),
	overlayChannel(sg, dg),
	overlayChannel(sb, db),
]

interface OverlayProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	flatten?: boolean
	children?: ReactNode
}

export function Overlay({ opacity, flatten, children, ...rest }: OverlayProps) {
	return (
		<RasterBlend blend={overlay} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	)
}
