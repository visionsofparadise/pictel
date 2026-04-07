import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { hslToRgb, rgbToHsl } from "./utils/hsl"
import { RasterBlend } from "../RasterBlend"

export const hue: BlendFormula = (sr, sg, sb, dr, dg, db) => {
	const srcHsl = rgbToHsl(sr * 255, sg * 255, sb * 255)
	const dstHsl = rgbToHsl(dr * 255, dg * 255, db * 255)
	const rgb = hslToRgb(srcHsl[0], dstHsl[1], dstHsl[2])

	return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255]
}

interface HueProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number
	flatten?: boolean
	children?: ReactNode
}

export function Hue({ opacity, flatten, children, ...rest }: HueProps) {
	return (
		<RasterBlend blend={hue} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	)
}
