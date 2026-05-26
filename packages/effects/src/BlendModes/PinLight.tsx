import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"

function pinLightChannel(dst: number, src: number): number {
	return src <= 0.5 ? Math.min(dst, 2 * src) : Math.max(dst, 2 * src - 1)
}

export const pinLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [pinLightChannel(dr, sr), pinLightChannel(dg, sg), pinLightChannel(db, sb)]

interface PinLightProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Replaces base values depending on the blend brightness. Dark blend values
 * darken via Darken; light blend values lighten via Lighten.
 *
 * @param props
 * @category Blend Modes
 */
export function PinLight({ apply, opacity = 1, children }: PinLightProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, pinLight, opacity)

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
