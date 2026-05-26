import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { applyDropShadowGpu } from "./applyDropShadowGpu"
import { mixBlend } from "./utils/mix-blend"
import { padImageData } from "./utils/pad-image-data"

interface DropShadowGpuProps {
	offsetX: number
	offsetY: number
	blurRadius: number
	color: string
	map?: ReactNode
	children: ReactNode
}

/**
 * GPU-accelerated counterpart to `DropShadow`. Same prop interface. Throws
 * via the standard `RasterEffect` error path when WebGPU is unavailable.
 *
 * @param props
 * @category Effects
 */
export function DropShadowGpu({
	offsetX,
	offsetY,
	blurRadius,
	color,
	map,
	children,
}: DropShadowGpuProps) {
	const effect = useCallback<RasterEffectCallback>(
		async (target, _apply, mapPixels) => {
			const result = await applyDropShadowGpu(target, offsetX, offsetY, blurRadius, color)

			if (mapPixels !== undefined) {
				const overflow = result.overflow ?? { top: 0, right: 0, bottom: 0, left: 0 }
				const paddedTarget = padImageData(target, overflow.top, overflow.right, overflow.bottom, overflow.left)
				const paddedMap = padImageData(mapPixels, overflow.top, overflow.right, overflow.bottom, overflow.left)

				return { pixels: mixBlend(paddedTarget, result.pixels, paddedMap), overflow }
			}

			return result
		},
		[offsetX, offsetY, blurRadius, color],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
