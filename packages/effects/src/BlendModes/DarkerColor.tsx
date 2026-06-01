import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"
import { luminance } from "./utils/luminance"

export const darkerColor: BlendFormula = (sr, sg, sb, dr, dg, db) => {
	const sl = luminance(sr, sg, sb)
	const dl = luminance(dr, dg, db)

	return sl < dl ? [sr, sg, sb] : [dr, dg, db]
}

interface DarkerColorProps {
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
 * Compares the overall luminance of base and blend pixels and keeps the darker one.
 * Unlike Darken, operates on the whole pixel rather than per-channel.
 *
 * @param props
 * @category Blend Modes
 */
export function DarkerColor({ apply, opacity = 1, children, version }: DarkerColorProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, darkerColor, opacity)

			return { pixels: blended }
		},
		[opacity],
	)
	/* eslint-enable @typescript-eslint/no-non-null-assertion */

	const internalVersion = `darkerColor@1+o=${opacity}`
	const composedVersion = version === undefined ? internalVersion : `${internalVersion}+${version}`

	return (
		<RasterEffect effect={effectCallback} apply={apply} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
