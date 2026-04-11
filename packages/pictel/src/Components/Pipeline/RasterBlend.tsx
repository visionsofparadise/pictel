import type { ReactNode } from "react"
import { useCallback } from "react"
import type { BlendFormula } from "../BlendModes/utils/blend-pixels"
import { blendPixels } from "../BlendModes/utils/blend-pixels"
import { CompositeEffect } from "./CompositeEffect"
import { luminance } from "../Effects/utils/luminance"
import { hasTargetChildren } from "./utils/has-target-children"

interface RasterBlendProps {
	/** Per-pixel blend formula function. Receives normalized source and destination RGB, returns blended RGB. */
	blend: BlendFormula
	opacity?: number
	flatten?: boolean
	children: ReactNode
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * Routing component for pixel-level blend modes. Applies a blend formula to
 * composited layers with optional map-driven opacity control.
 *
 * - `blend` — Per-pixel blend formula function. Receives normalized source and destination RGB, returns blended RGB.
 *
 * @param props
 * @category Pipeline
 */
export function RasterBlend({ blend, opacity = 1, flatten, children }: RasterBlendProps) {
	const hasContent = hasTargetChildren(children)

	const effect = useCallback(
		(self: ImageData, behind: ImageData, map?: ImageData) => {
			const blended = blendPixels(self, behind, blend)
			const blendedData = blended.data
			const behindData = behind.data
			const out = new Uint8ClampedArray(behindData.length)

			if (!map) {
				if (opacity < 1) {
					for (let px = 0; px < behindData.length; px += 4) {
						out[px] = behindData[px]! + opacity * (blendedData[px]! - behindData[px]!)
						out[px + 1] = behindData[px + 1]! + opacity * (blendedData[px + 1]! - behindData[px + 1]!)
						out[px + 2] = behindData[px + 2]! + opacity * (blendedData[px + 2]! - behindData[px + 2]!)
						out[px + 3] = behindData[px + 3]! + opacity * (blendedData[px + 3]! - behindData[px + 3]!)
					}

					return new ImageData(out, behind.width, behind.height)
				}

				return blended
			}

			const mapData = map.data

			for (let px = 0; px < behindData.length; px += 4) {
				const factor = luminance(mapData[px]!, mapData[px + 1]!, mapData[px + 2]!) / 255 * opacity

				out[px] = behindData[px]! + factor * (blendedData[px]! - behindData[px]!)
				out[px + 1] = behindData[px + 1]! + factor * (blendedData[px + 1]! - behindData[px + 1]!)
				out[px + 2] = behindData[px + 2]! + factor * (blendedData[px + 2]! - behindData[px + 2]!)
				out[px + 3] = behindData[px + 3]! + factor * (blendedData[px + 3]! - behindData[px + 3]!)
			}

			return new ImageData(out, behind.width, behind.height)
		},
		[blend, opacity],
	)

	if (!hasContent) {
		return <div style={{ display: "none" }}>{children}</div>
	}

	return (
		<CompositeEffect effect={effect} flatten={flatten}>
			{children}
		</CompositeEffect>
	)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */
