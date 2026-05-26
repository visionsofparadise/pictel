import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"

export const darken: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	Math.min(sr, dr),
	Math.min(sg, dg),
	Math.min(sb, db),
]

interface DarkenProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Keeps the darker of the base or blend value for each channel.
 * Useful for removing white backgrounds or combining dark elements.
 *
 * @param props
 * @category Blend Modes
 */
export function Darken({ apply, opacity = 1, children }: DarkenProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, darken, opacity)

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
