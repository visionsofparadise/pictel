import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"
import { vividLightChannel } from "./utils/vivid-light-channel"

export const hardMix: BlendFormula = (sr, sg, sb, dr, dg, db) => [vividLightChannel(dr, sr) >= 0.5 ? 1 : 0, vividLightChannel(dg, sg) >= 0.5 ? 1 : 0, vividLightChannel(db, sb) >= 0.5 ? 1 : 0]

interface HardMixProps {
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
 * Reduces each channel to fully on or fully off based on Vivid Light thresholding.
 * Produces posterized, high-contrast results with at most 8 colors.
 *
 * @param props
 * @category Blend Modes
 */
export function HardMix({ apply, opacity = 1, children, version }: HardMixProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, hardMix, opacity)

			return { pixels: blended }
		},
		[opacity],
	)
	/* eslint-enable @typescript-eslint/no-non-null-assertion */

	const internalVersion = `hardMix@1+o=${opacity}`
	const composedVersion = version === undefined ? internalVersion : `${internalVersion}+${version}`

	return (
		<RasterEffect effect={effectCallback} apply={apply} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
