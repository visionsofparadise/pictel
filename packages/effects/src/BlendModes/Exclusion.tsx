import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"

export const exclusion: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	sr + dr - 2 * sr * dr,
	sg + dg - 2 * sg * dg,
	sb + db - 2 * sb * db,
]

interface ExclusionProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Similar to Difference but with lower contrast. Produces a softer inversion effect.
 * Blending with white inverts the base; blending with black has no effect.
 *
 * @param props
 * @category Blend Modes
 */
export function Exclusion({ apply, opacity = 1, children }: ExclusionProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, exclusion, opacity)

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
