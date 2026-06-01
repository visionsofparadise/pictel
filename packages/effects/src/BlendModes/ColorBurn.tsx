import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"
import { colorBurn as colorBurnChannel } from "./utils/color-burn"

export const colorBurn: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	colorBurnChannel(dr, sr),
	colorBurnChannel(dg, sg),
	colorBurnChannel(db, sb),
]

interface ColorBurnProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
	/**
	 * Optional cache-bust handle. Composed with this blend mode's internal version;
	 * bumping invalidates the cached output for this subtree.
	 */
	version?: string
}

/**
 * Darkens the base by increasing contrast relative to the blend layer.
 * Produces deeper shadows than Multiply with more saturated mid-tones.
 *
 * @param props
 * @category Blend Modes
 */
export function ColorBurn({ apply, opacity = 1, children, version }: ColorBurnProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, colorBurn, opacity)

			return { pixels: blended }
		},
		[opacity],
	)
	/* eslint-enable @typescript-eslint/no-non-null-assertion */

	const internalVersion = `colorBurn@1+o=${opacity}`
	const composedVersion = version === undefined ? internalVersion : `${internalVersion}+${version}`

	return (
		<RasterEffect effect={effectCallback} apply={apply} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
