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
	/**
	 * Optional cache-bust handle. Composed with this effect's internal version;
	 * bumping invalidates the cached output for this subtree.
	 */
	version?: string
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
	version,
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

	const internalVersion = `outline@1+gpu+s=${sigma}+k=${kappa}+e=${epsilon}+p=${phi}+m=${mode}`
	const composedVersion = version === undefined ? internalVersion : `${internalVersion}+${version}`

	return (
		<RasterEffect effect={effect} map={map} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
