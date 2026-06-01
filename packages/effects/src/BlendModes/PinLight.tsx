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
	/**
	 * Optional cache-bust handle. Composed with this blend mode's internal version;
	 * bumping invalidates the cached output for this subtree.
	 */
	version?: string
}

/**
 * Replaces base values depending on the blend brightness. Dark blend values
 * darken via Darken; light blend values lighten via Lighten.
 *
 * @param props
 * @category Blend Modes
 */
export function PinLight({ apply, opacity = 1, children, version }: PinLightProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, pinLight, opacity)

			return { pixels: blended }
		},
		[opacity],
	)
	/* eslint-enable @typescript-eslint/no-non-null-assertion */

	const internalVersion = `pinLight@1+o=${opacity}`
	const composedVersion = version === undefined ? internalVersion : `${internalVersion}+${version}`

	return (
		<RasterEffect effect={effectCallback} apply={apply} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
