import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"

export const linearBurn: BlendFormula = (sr, sg, sb, dr, dg, db) => [Math.max(0, sr + dr - 1), Math.max(0, sg + dg - 1), Math.max(0, sb + db - 1)]

interface LinearBurnProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Adds the base and blend values then subtracts 1 per channel. Produces darker results
 * than Multiply with a linear falloff.
 *
 * @param props
 * @category Blend Modes
 */
export function LinearBurn({ apply, opacity = 1, children }: LinearBurnProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, linearBurn, opacity)

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
