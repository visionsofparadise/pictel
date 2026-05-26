import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"

export const linearDodge: BlendFormula = (sr, sg, sb, dr, dg, db) => [Math.min(1, sr + dr), Math.min(1, sg + dg), Math.min(1, sb + db)]

interface LinearDodgeProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Adds the base and blend values per channel, clamped to white.
 * Also known as Add. Produces lighter results than Screen with a linear curve.
 *
 * @param props
 * @category Blend Modes
 */
export function LinearDodge({ apply, opacity = 1, children }: LinearDodgeProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, linearDodge, opacity)

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
