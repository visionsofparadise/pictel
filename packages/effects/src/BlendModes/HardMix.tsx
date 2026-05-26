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
}

/**
 * Reduces each channel to fully on or fully off based on Vivid Light thresholding.
 * Produces posterized, high-contrast results with at most 8 colors.
 *
 * @param props
 * @category Blend Modes
 */
export function HardMix({ apply, opacity = 1, children }: HardMixProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, hardMix)

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
