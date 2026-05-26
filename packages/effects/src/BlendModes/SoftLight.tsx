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
}

/**
 * Gently darkens or lightens depending on the blend value.
 * Like shining a diffused light on the base. Subtler than Overlay or Hard Light.
 *
 * @param props
 * @category Blend Modes
 */
export function SoftLight({ apply, opacity = 1, children }: SoftLightProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, softLight)

			if (opacity < 1) {
				const blendedData = blended.data
				const targetData = target.data
				const out = new Uint8ClampedArray(targetData.length)

				for (let px = 0; px < targetData.length; px += 4) {
					out[px] = targetData[px]! + opacity * (blendedData[px]! - targetData[px]!)
					out[px + 1] = targetData[px + 1]! + opacity * (blendedData[px + 1]! - targetData[px + 1]!)
					out[px + 2] = targetData[px + 2]! + opacity * (blendedData[px + 2]! - targetData[px + 2]!)
					out[px + 3] = targetData[px + 3]! + opacity * (blendedData[px + 3]! - targetData[px + 3]!)
				}

				return { pixels: new ImageData(out, target.width, target.height) }
			}

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
