import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"
import { hslToRgb, rgbToHsl } from "./utils/hsl"

export const saturation: BlendFormula = (sr, sg, sb, dr, dg, db) => {
	const srcHsl = rgbToHsl(sr * 255, sg * 255, sb * 255)
	const dstHsl = rgbToHsl(dr * 255, dg * 255, db * 255)
	const rgb = hslToRgb(dstHsl[0], srcHsl[1], dstHsl[2])

	return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255]
}

interface SaturationProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Applies the saturation of the blend layer while preserving the hue and luminosity of the base.
 * Useful for adjusting color intensity without changing the underlying colors.
 *
 * @param props
 * @category Blend Modes
 */
export function Saturation({ apply, opacity = 1, children }: SaturationProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, saturation)

			if (opacity < 1) {
				const blendedData = blended.data
				const targetData = target.data
				const out = new Uint8ClampedArray(targetData.length)

				for (let px = 0; px < targetData.length; px += 4) {
					out[px] = targetData[px]! + opacity * (blendedData[px]! - targetData[px]!)
					out[px + 1] = targetData[px + 1]! + opacity * (blendedData[px + 1]! - targetData[px + 1]!)
					out[px + 2] = targetData[px + 2]! + opacity * (blendedData[px + 2]! - targetData[px + 2]!)
					out[px + 3] = targetData[px + 3]! + opacity * (blendedData[px + 3]! - targetData[px + 3]!)
				}

				return { pixels: new ImageData(out, target.width, target.height) }
			}

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
