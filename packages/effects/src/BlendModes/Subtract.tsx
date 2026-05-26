import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"

export const subtract: BlendFormula = (sr, sg, sb, dr, dg, db) => [Math.max(0, dr - sr), Math.max(0, dg - sg), Math.max(0, db - sb)]

interface SubtractProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Subtracts the blend color from the base color per channel, clamped to black.
 * Produces dark results; useful for masking or creating silhouettes.
 *
 * @param props
 * @category Blend Modes
 */
export function Subtract({ apply, opacity = 1, children }: SubtractProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, subtract, opacity)

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
