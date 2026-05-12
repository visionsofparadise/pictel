import { useCallback, type ReactNode } from "react"
import { Pipeline, type PipelineCallback } from "../Pipeline/Pipeline"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"

function hardLightChannel(sr: number, dr: number): number {
	return sr <= 0.5 ? 2 * sr * dr : 1 - 2 * (1 - sr) * (1 - dr)
}

export const hardLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	hardLightChannel(sr, dr),
	hardLightChannel(sg, dg),
	hardLightChannel(sb, db),
]

interface HardLightProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Multiplies dark blend values and screens light blend values.
 * Like shining a harsh light on the base layer. Inverse of Overlay.
 *
 * @param props
 * @category Blend Modes
 */
export function HardLight({ apply, opacity = 1, children }: HardLightProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<PipelineCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, hardLight)

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
		<Pipeline effect={effectCallback} apply={apply}>
			{children}
		</Pipeline>
	)
}
