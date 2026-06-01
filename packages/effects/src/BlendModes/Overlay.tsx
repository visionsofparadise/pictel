import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"

function overlayChannel(sr: number, dr: number): number {
	return dr <= 0.5 ? 2 * sr * dr : 1 - 2 * (1 - sr) * (1 - dr)
}

export const overlay: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	overlayChannel(sr, dr),
	overlayChannel(sg, dg),
	overlayChannel(sb, db),
]

interface OverlayProps {
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
 * Multiplies dark base values and screens light base values.
 * Increases contrast while preserving highlights and shadows. Most common contrast blend mode.
 *
 * @param props
 * @category Blend Modes
 */
export function Overlay({ apply, opacity = 1, children, version }: OverlayProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, overlay, opacity)

			return { pixels: blended }
		},
		[opacity],
	)
	/* eslint-enable @typescript-eslint/no-non-null-assertion */

	const internalVersion = `overlay@1+o=${opacity}`
	const composedVersion = version === undefined ? internalVersion : `${internalVersion}+${version}`

	return (
		<RasterEffect effect={effectCallback} apply={apply} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
