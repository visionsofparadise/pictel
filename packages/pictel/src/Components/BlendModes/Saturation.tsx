import type { ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { hslToRgb, rgbToHsl } from "./utils/hsl"
import { RasterBlend } from "../Pipeline/RasterBlend"

export const saturation: BlendFormula = (sr, sg, sb, dr, dg, db) => {
	const srcHsl = rgbToHsl(sr * 255, sg * 255, sb * 255)
	const dstHsl = rgbToHsl(dr * 255, dg * 255, db * 255)
	const rgb = hslToRgb(dstHsl[0], srcHsl[1], dstHsl[2])

	return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255]
}

interface SaturationProps {
	opacity?: number
	flatten?: boolean
	children: ReactNode
}

/**
 * Applies the saturation of the blend layer while preserving the hue and luminosity of the base.
 * Useful for adjusting color intensity without changing the underlying colors.
 *
 * @param props
 * @category Blend Modes
 */
export function Saturation({ opacity, flatten, children }: SaturationProps) {
	return (
		<RasterBlend blend={saturation} opacity={opacity} flatten={flatten}>
			{children}
		</RasterBlend>
	)
}
