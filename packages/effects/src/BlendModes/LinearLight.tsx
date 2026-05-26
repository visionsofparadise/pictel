import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"

function linearLightChannel(dst: number, src: number): number {
	return src <= 0.5 ? Math.max(0, dst + 2 * src - 1) : Math.min(1, dst + 2 * src - 1)
}

export const linearLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [linearLightChannel(dr, sr), linearLightChannel(dg, sg), linearLightChannel(db, sb)]

interface LinearLightProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Combines Linear Burn and Linear Dodge based on the blend brightness.
 * Burns darks and dodges lights with linear intensity scaling.
 *
 * @param props
 * @category Blend Modes
 */
export function LinearLight({ apply, opacity = 1, children }: LinearLightProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<RasterEffectCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, linearLight)

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
