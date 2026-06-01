import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"
import { hslToRgb, rgbToHsl } from "./utils/hsl"

export const color: BlendFormula = (sr, sg, sb, dr, dg, db) => {
	const srcHsl = rgbToHsl(sr * 255, sg * 255, sb * 255)
	const dstHsl = rgbToHsl(dr * 255, dg * 255, db * 255)
	const rgb = hslToRgb(srcHsl[0], srcHsl[1], dstHsl[2])

	return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255]
}

interface ColorProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
	/**
	 * Optional cache-bust handle. Composed with this blend mode's internal version;
	 * bumping invalidates the cached output for this subtree.
	 */
	version?: string
}

/**
 * Applies the hue and saturation of the blend layer while preserving the luminosity of the base.
 * Useful for colorizing grayscale images or shifting color tones.
 *
 * @param props
 * @category Blend Modes
 */
export function Color({ apply, opacity = 1, children, version }: ColorProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, color, opacity)

			return { pixels: blended }
		},
		[opacity],
	)
	/* eslint-enable @typescript-eslint/no-non-null-assertion */

	const internalVersion = `color@1+o=${opacity}`
	const composedVersion = version === undefined ? internalVersion : `${internalVersion}+${version}`

	return (
		<RasterEffect effect={effectCallback} apply={apply} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
