import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"

function hardLightChannel(sr: number, dr: number): number {
	return sr <= 0.5 ? 2 * sr * dr : 1 - 2 * (1 - sr) * (1 - dr)
}

export const hardLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	hardLightChannel(sr, dr),
	hardLightChannel(sg, dg),
	hardLightChannel(sb, db),
]

interface HardLightProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Multiplies dark blend values and screens light blend values.
 * Like shining a harsh light on the base layer. Inverse of Overlay.
 *
 * @param props
 * @category Blend Modes
 */
export function HardLight({ apply, opacity = 1, children }: HardLightProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, hardLight, opacity)

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
