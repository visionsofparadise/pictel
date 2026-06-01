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
	/**
	 * Optional cache-bust handle. Composed with this effect's internal version;
	 * bumping invalidates the cached output for this subtree.
	 */
	version?: string
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
	version,
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

	const internalVersion = `bloom@1+gpu+t=${threshold}+r=${radius}+i=${intensity}+m=${mode}`
	const composedVersion = version === undefined ? internalVersion : `${internalVersion}+${version}`

	return (
		<RasterEffect effect={effect} map={map} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
