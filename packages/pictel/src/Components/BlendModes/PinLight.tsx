import { useCallback, type ReactNode } from "react"
import { Pipeline, type PipelineCallback } from "../Pipeline/Pipeline"
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
}

/**
 * Replaces base values depending on the blend brightness. Dark blend values
 * darken via Darken; light blend values lighten via Lighten.
 *
 * @param props
 * @category Blend Modes
 */
export function PinLight({ apply, opacity = 1, children }: PinLightProps) {
	/* eslint-disable @typescript-eslint/no-non-null-assertion */
	const effectCallback = useCallback<PipelineCallback>(
		(target, applyPixels) => {
			const blended = blendPixels(applyPixels!, target, pinLight)

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
