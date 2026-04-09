import type { ComponentProps } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { hslToRgb, rgbToHsl } from "./utils/hsl"
import { RasterBlend } from "../Pipeline/RasterBlend"

export const luminosity: BlendFormula = (sr, sg, sb, dr, dg, db) => {
	const srcHsl = rgbToHsl(sr * 255, sg * 255, sb * 255)
	const dstHsl = rgbToHsl(dr * 255, dg * 255, db * 255)
	const rgb = hslToRgb(dstHsl[0], dstHsl[1], srcHsl[2])

	return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255]
}

interface LuminosityProps extends ComponentProps<"div"> {
	opacity?: number
	flatten?: boolean
}

/**
 * Applies the luminosity of the blend layer while preserving the hue and saturation of the base.
 * Inverse of Color blend mode. Useful for applying tonal values from one image to another.
 *
 * @param props
 * @category Blend Modes
 */
export function Luminosity({ opacity, flatten, ...rest }: LuminosityProps) {
	return (
		<RasterBlend blend={luminosity} opacity={opacity} flatten={flatten} {...rest} />
	)
}
