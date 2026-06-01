import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"

function softLightD(x: number): number {
	return x <= 0.25 ? ((16 * x - 12) * x + 4) * x : Math.sqrt(x)
}

function softLightChannel(sr: number, dr: number): number {
	return sr <= 0.5
		? dr - (1 - 2 * sr) * dr * (1 - dr)
		: dr + (2 * sr - 1) * (softLightD(dr) - dr)
}

export const softLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	softLightChannel(sr, dr),
	softLightChannel(sg, dg),
	softLightChannel(sb, db),
]

interface SoftLightProps {
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
 * Gently darkens or lightens depending on the blend value.
 * Like shining a diffused light on the base. Subtler than Overlay or Hard Light.
 *
 * @param props
 * @category Blend Modes
 */
export function SoftLight({ apply, opacity = 1, children, version }: SoftLightProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, softLight, opacity)

			return { pixels: blended }
		},
		[opacity],
	)
	/* eslint-enable @typescript-eslint/no-non-null-assertion */

	const internalVersion = `softLight@1+o=${opacity}`
	const composedVersion = version === undefined ? internalVersion : `${internalVersion}+${version}`

	return (
		<RasterEffect effect={effectCallback} apply={apply} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
