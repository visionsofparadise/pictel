import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"
import { vividLightChannel } from "./utils/vivid-light-channel"

export const vividLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [vividLightChannel(dr, sr), vividLightChannel(dg, sg), vividLightChannel(db, sb)]

interface VividLightProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Combines Color Burn and Color Dodge based on the blend brightness.
 * Dark blend values increase contrast via burn; light values decrease via dodge.
 *
 * @param props
 * @category Blend Modes
 */
export function VividLight({ apply, opacity = 1, children }: VividLightProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, vividLight, opacity)

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
