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
	/**
	 * Optional cache-bust handle. Composed with this blend mode's internal version;
	 * bumping invalidates the cached output for this subtree.
	 */
	version?: string
}

/**
 * Brightens the base by decreasing contrast relative to the blend layer.
 * Produces lighter highlights than Screen with more vivid color shifts.
 *
 * @param props
 * @category Blend Modes
 */
export function ColorDodge({ apply, opacity = 1, children, version }: ColorDodgeProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, colorDodge, opacity)

			return { pixels: blended }
		},
		[opacity],
	)
	/* eslint-enable @typescript-eslint/no-non-null-assertion */

	const internalVersion = `colorDodge@1+o=${opacity}`
	const composedVersion = version === undefined ? internalVersion : `${internalVersion}+${version}`

	return (
		<RasterEffect effect={effectCallback} apply={apply} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
