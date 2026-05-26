import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"

export const difference: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	Math.abs(sr - dr),
	Math.abs(sg - dg),
	Math.abs(sb - db),
]

interface DifferenceProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Subtracts the darker color from the lighter for each channel.
 * Identical layers produce black; useful for comparing or creating inverted effects.
 *
 * @param props
 * @category Blend Modes
 */
export function Difference({ apply, opacity = 1, children }: DifferenceProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, difference, opacity)

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
