import { useCallback, type ReactNode } from "react"
import { Pipeline, type PipelineCallback } from "../Pipeline/Pipeline"
import type { BlendFormula } from "./utils/blend-pixels"
import { blendPixels } from "./utils/blend-pixels"

export const subtract: BlendFormula = (sr, sg, sb, dr, dg, db) => [Math.max(0, dr - sr), Math.max(0, dg - sg), Math.max(0, db - sb)]

interface SubtractProps {
	apply: ReactNode
	opacity?: number
	children: ReactNode
}

/**
 * Subtracts the blend color from the base color per channel, clamped to black.
 * Produces dark results; useful for masking or creating silhouettes.
 *
 * @param props
 * @category Blend Modes
 */
export function Subtract({ apply, opacity = 1, children }: SubtractProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<PipelineCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, subtract)

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
