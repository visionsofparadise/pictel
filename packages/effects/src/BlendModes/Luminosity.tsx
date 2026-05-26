import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"
import { hslToRgb, rgbToHsl } from "./utils/hsl"

export const luminosity: BlendFormula = (sr, sg, sb, dr, dg, db) => {
	const srcHsl = rgbToHsl(sr * 255, sg * 255, sb * 255)
	const dstHsl = rgbToHsl(dr * 255, dg * 255, db * 255)
	const rgb = hslToRgb(dstHsl[0], dstHsl[1], srcHsl[2])

	return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255]
}

interface LuminosityProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Applies the luminosity of the blend layer while preserving the hue and saturation of the base.
 * Inverse of Color blend mode. Useful for applying tonal values from one image to another.
 *
 * @param props
 * @category Blend Modes
 */
export function Luminosity({ apply, opacity = 1, children }: LuminosityProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, luminosity, opacity)

			return { pixels: blended }
		},
		[opacity],
	)
	/* eslint-enable @typescript-eslint/no-non-null-assertion */

	return (
		<RasterEffect effect={effectCallback} apply={apply}>
			{children}
		</RasterEffect>
	)
}
