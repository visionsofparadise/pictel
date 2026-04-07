import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { hslToRgb, rgbToHsl } from "./utils/hsl"
import { RasterBlend } from "../RasterBlend"

export const color: BlendFormula = (sr, sg, sb, dr, dg, db) => {
	const srcHsl = rgbToHsl(sr * 255, sg * 255, sb * 255)
	const dstHsl = rgbToHsl(dr * 255, dg * 255, db * 255)
	const rgb = hslToRgb(srcHsl[0], srcHsl[1], dstHsl[2])

	return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255]
}

interface ColorProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	flatten?: boolean
	children?: ReactNode
}

export function Color({ opacity, flatten, children, ...rest }: ColorProps) {
	return (
		<RasterBlend blend={color} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	)
}
