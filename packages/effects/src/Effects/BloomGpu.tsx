import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { applyBloomGpu, applyMappedBloomGpu } from "./applyBloomGpu"
import { mixBlend } from "./utils/mix-blend"

interface BloomGpuProps {
	threshold?: number
	radius?: number
	intensity?: number
	mode?: "parameter" | "mix"
	map?: ReactNode
	children: ReactNode
}

/**
 * GPU-accelerated counterpart to `Bloom`. Same prop interface. Throws via the
 * standard `RasterEffect` error path when WebGPU is unavailable.
 *
 * @param props
 * @category Effects
 */
export function BloomGpu({
	threshold = 0.75,
	radius = 16,
	intensity = 1,
	mode = "parameter",
	map,
	children,
}: BloomGpuProps) {
	const effect = useCallback<RasterEffectCallback>(
		async (target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				if (mode === "parameter") {
					return applyMappedBloomGpu(target, mapPixels, threshold, radius, intensity)
				}

				const result = await applyBloomGpu(target, threshold, radius, intensity)

				return mixBlend(target, result, mapPixels)
			}

			return applyBloomGpu(target, threshold, radius, intensity)
		},
		[threshold, radius, intensity, mode],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
