import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"

export const divide: BlendFormula = (sr, sg, sb, dr, dg, db) => [sr === 0 ? 1 : Math.min(1, dr / sr), sg === 0 ? 1 : Math.min(1, dg / sg), sb === 0 ? 1 : Math.min(1, db / sb)]

interface DivideProps {
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
 * Divides the base color by the blend color, producing a brightening effect.
 * Dark blend values create strong brightening; useful for removing color casts.
 *
 * @param props
 * @category Blend Modes
 */
export function Divide({ apply, opacity = 1, children, version }: DivideProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, divide, opacity)

			return { pixels: blended }
		},
		[opacity],
	)
	/* eslint-enable @typescript-eslint/no-non-null-assertion */

	const internalVersion = `divide@1+o=${opacity}`
	const composedVersion = version === undefined ? internalVersion : `${internalVersion}+${version}`

	return (
		<RasterEffect effect={effectCallback} apply={apply} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
