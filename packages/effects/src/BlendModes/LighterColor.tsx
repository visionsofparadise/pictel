import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"
import { luminance } from "./utils/luminance"

export const lighterColor: BlendFormula = (sr, sg, sb, dr, dg, db) => {
	const sl = luminance(sr, sg, sb)
	const dl = luminance(dr, dg, db)

	return sl > dl ? [sr, sg, sb] : [dr, dg, db]
}

interface LighterColorProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Compares the overall luminance of base and blend pixels and keeps the lighter one.
 * Unlike Lighten, operates on the whole pixel rather than per-channel.
 *
 * @param props
 * @category Blend Modes
 */
export function LighterColor({ apply, opacity = 1, children }: LighterColorProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, lighterColor, opacity)

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
