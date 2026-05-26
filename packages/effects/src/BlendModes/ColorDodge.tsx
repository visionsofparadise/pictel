import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"
import { colorDodge as colorDodgeChannel } from "./utils/color-dodge"

export const colorDodge: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	colorDodgeChannel(dr, sr),
	colorDodgeChannel(dg, sg),
	colorDodgeChannel(db, sb),
]

interface ColorDodgeProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Brightens the base by decreasing contrast relative to the blend layer.
 * Produces lighter highlights than Screen with more vivid color shifts.
 *
 * @param props
 * @category Blend Modes
 */
export function ColorDodge({ apply, opacity = 1, children }: ColorDodgeProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, colorDodge, opacity)

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
