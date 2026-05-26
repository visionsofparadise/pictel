import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"

export const screen: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	sr + dr - sr * dr,
	sg + dg - sg * dg,
	sb + db - sb * db,
]

interface ScreenProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Multiplies the inverse of base and blend, producing lighter results.
 * Black is transparent; white produces white. Standard lightening mode.
 *
 * @param props
 * @category Blend Modes
 */
export function Screen({ apply, opacity = 1, children }: ScreenProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, screen, opacity)

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
