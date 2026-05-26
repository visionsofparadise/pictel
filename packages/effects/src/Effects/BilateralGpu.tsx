import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { applyBilateralGpu } from "./applyBilateralGpu"
import { mixBlend } from "./utils/mix-blend"

/**
 * GPU-accelerated counterpart to `Bilateral`. Same prop interface; runs the
 * filter as a WebGPU compute dispatch. Throws via the standard `RasterEffect`
 * error path when WebGPU is unavailable — no CPU fallback (use `Bilateral`
 * directly when WebGPU support isn't guaranteed).
 *
 * Recommended over `Bilateral` for `spatialSigma >= 4` and large images where
 * the CPU implementation's O(W·H·r²) gather is interactive-blocking.
 *
 * @param props
 * @category Effects
 */
export async function applyMappedBilateralGpu(
	pixels: ImageData,
	map: ImageData,
	spatialSigma: number,
	colorSigma: number,
): Promise<ImageData> {
	const filtered = await applyBilateralGpu(pixels, spatialSigma, colorSigma)

	return mixBlend(pixels, filtered, map)
}

interface BilateralGpuProps {
	spatialSigma: number
	colorSigma: number
	mode?: "parameter" | "mix"
	map?: ReactNode
	children: ReactNode
}

export function BilateralGpu({
	spatialSigma,
	colorSigma,
	mode = "parameter",
	map,
	children,
}: BilateralGpuProps) {
	const effect = useCallback<RasterEffectCallback>(
		async (target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				if (mode === "parameter") {
					return await applyMappedBilateralGpu(target, mapPixels, spatialSigma, colorSigma)
				}

				const result = await applyBilateralGpu(target, spatialSigma, colorSigma)

				return mixBlend(target, result, mapPixels)
			}

			return await applyBilateralGpu(target, spatialSigma, colorSigma)
		},
		[spatialSigma, colorSigma, mode],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
