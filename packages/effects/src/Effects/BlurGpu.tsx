import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { applyBlurGpu } from "./applyBlurGpu"

interface BlurGpuProps {
	radius: number
	children: ReactNode
	/**
	 * Optional cache-bust handle. Composed with this effect's internal version;
	 * bumping invalidates the cached output for this subtree.
	 */
	version?: string
}

/**
 * GPU-accelerated counterpart to `Blur` (parameter mode only — the variable
 * (mapped) blur stays CPU). Runs the Gaussian-approximation box-blur cascade
 * as WebGPU compute dispatches. Throws via the standard `RasterEffect` error
 * path when WebGPU is unavailable — no CPU fallback (use `Blur` directly when
 * WebGPU support isn't guaranteed).
 *
 * Output dimensions and overflow match `Blur` exactly; per-pixel values match
 * within float-precision tolerance.
 *
 * - `radius` — Blur radius in pixels.
 *
 * @param props
 * @category Effects
 */
export function BlurGpu({ radius, children, version }: BlurGpuProps) {
	const effect = useCallback<RasterEffectCallback>(
		async (target) => applyBlurGpu(target, radius),
		[radius],
	)

	const internalVersion = `blur@1+gpu+r=${radius}`
	const composedVersion = version === undefined ? internalVersion : `${internalVersion}+${version}`

	return (
		<RasterEffect effect={effect} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
