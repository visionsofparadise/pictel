import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"

function linearLightChannel(dst: number, src: number): number {
	return src <= 0.5 ? Math.max(0, dst + 2 * src - 1) : Math.min(1, dst + 2 * src - 1)
}

export const linearLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [linearLightChannel(dr, sr), linearLightChannel(dg, sg), linearLightChannel(db, sb)]

interface LinearLightProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Combines Linear Burn and Linear Dodge based on the blend brightness.
 * Burns darks and dodges lights with linear intensity scaling.
 *
 * @param props
 * @category Blend Modes
 */
export function LinearLight({ apply, opacity = 1, children }: LinearLightProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, linearLight, opacity)

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
