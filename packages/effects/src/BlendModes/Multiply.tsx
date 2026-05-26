import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"

export const multiply: BlendFormula = (sr, sg, sb, dr, dg, db) => [sr * dr, sg * dg, sb * db]

interface MultiplyProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Multiplies base and blend values per channel, producing darker results.
 * White is transparent; black produces black. Standard darkening mode.
 *
 * @param props
 * @category Blend Modes
 */
export function Multiply({ apply, opacity = 1, children }: MultiplyProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, multiply, opacity)

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
