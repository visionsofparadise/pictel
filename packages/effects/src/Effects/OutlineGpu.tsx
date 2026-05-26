import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { applyMappedOutlineGpu, applyOutlineGpu } from "./applyOutlineGpu"
import { mixBlend } from "./utils/mix-blend"

interface OutlineGpuProps {
	sigma?: number
	k?: number
	epsilon?: number
	phi?: number
	mode?: "parameter" | "mix"
	map?: ReactNode
	children: ReactNode
}

/**
 * GPU-accelerated counterpart to `Outline`. Same prop interface. Throws via
 * the standard `RasterEffect` error path when WebGPU is unavailable.
 *
 * @param props
 * @category Effects
 */
export function OutlineGpu({
	sigma = 1.0,
	k: kappa = 1.6,
	epsilon = 0,
	phi = 200,
	mode = "parameter",
	map,
	children,
}: OutlineGpuProps) {
	const effect = useCallback<RasterEffectCallback>(
		async (target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				if (mode === "parameter") {
					return applyMappedOutlineGpu(target, mapPixels, sigma, kappa, epsilon, phi)
				}

				const result = await applyOutlineGpu(target, sigma, kappa, epsilon, phi)

				return mixBlend(target, result, mapPixels)
			}

			return applyOutlineGpu(target, sigma, kappa, epsilon, phi)
		},
		[sigma, kappa, epsilon, phi, mode],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
