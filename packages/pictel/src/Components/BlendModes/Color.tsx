import type { ReactNode } from "react"
import type { BlendFormula } from "./utils/blend-pixels"
import { hslToRgb, rgbToHsl } from "./utils/hsl"
import { RasterBlend } from "../Pipeline/RasterBlend"

export const color: BlendFormula = (sr, sg, sb, dr, dg, db) => {
	const srcHsl = rgbToHsl(sr * 255, sg * 255, sb * 255)
	const dstHsl = rgbToHsl(dr * 255, dg * 255, db * 255)
	const rgb = hslToRgb(srcHsl[0], srcHsl[1], dstHsl[2])

	return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255]
}

interface ColorProps {
	opacity?: number
	children: ReactNode
}

/**
 * Applies the hue and saturation of the blend layer while preserving the luminosity of the base.
 * Useful for colorizing grayscale images or shifting color tones.
 *
 * @param props
 * @category Blend Modes
 */
export function Color({ opacity, children }: ColorProps) {
	return (
		<RasterBlend blend={color} opacity={opacity}>
			{children}
		</RasterBlend>
	)
}
