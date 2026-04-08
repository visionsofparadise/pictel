import type { ComponentProps } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { hslToRgb, rgbToHsl } from "./utils/hsl"
import { RasterBlend } from "../RasterBlend"

export const saturation: BlendFormula = (sr, sg, sb, dr, dg, db) => {
	const srcHsl = rgbToHsl(sr * 255, sg * 255, sb * 255)
	const dstHsl = rgbToHsl(dr * 255, dg * 255, db * 255)
	const rgb = hslToRgb(dstHsl[0], srcHsl[1], dstHsl[2])

	return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255]
}

interface SaturationProps extends ComponentProps<"div"> {
	opacity?: number
	flatten?: boolean
}

/**
 * Applies the saturation of the blend layer while preserving the hue and luminosity of the base.
 * Useful for adjusting color intensity without changing the underlying colors.
 *
 * @param props
 * @category Blend Modes
 */
export function Saturation({ opacity, flatten, ...rest }: SaturationProps) {
	return (
		<RasterBlend blend={saturation} opacity={opacity} flatten={flatten} {...rest} />
	)
}
