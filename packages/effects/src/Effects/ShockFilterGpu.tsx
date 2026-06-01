import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { applyShockFilterGpu } from "./applyShockFilterGpu"
import { mixBlend } from "./utils/mix-blend"

interface ShockFilterGpuProps {
	iterations?: number
	strength?: number
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
 * GPU-accelerated counterpart to `ShockFilter`. The iteration loop stays
 * entirely on GPU — only the initial upload and final readback cross the
 * CPU/GPU boundary. Same prop interface as `ShockFilter`.
 *
 * Throws via the standard `RasterEffect` error path when WebGPU is unavailable.
 *
 * @param props
 * @category Effects
 */
export function ShockFilterGpu({
	iterations = 8,
	strength = 1,
	mode = "parameter",
	map,
	children,
	version,
}: ShockFilterGpuProps) {
	const effect = useCallback<RasterEffectCallback>(
		async (target, _apply, mapPixels) => {
			const result = await applyShockFilterGpu(target, iterations, strength)

			if (mapPixels !== undefined) {
				if (mode === "parameter") {
					return mixBlend(target, result, mapPixels)
				}

				return mixBlend(target, result, mapPixels)
			}

			return result
		},
		[iterations, strength, mode],
	)

	const internalVersion = `shockFilter@1+gpu+i=${iterations}+s=${strength}+m=${mode}`
	const composedVersion = version === undefined ? internalVersion : `${internalVersion}+${version}`

	return (
		<RasterEffect effect={effect} map={map} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
