import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { applyLicGpu } from "./applyLicGpu"

interface LICGpuProps {
	length?: number
	stepSize?: number
	uniformStep?: boolean
	map: ReactNode
	children: ReactNode
}

/**
 * WebGPU-backed `LIC` — line integral convolution accelerated by hardware
 * bilinear texture sampling. Public API matches `LIC` exactly. Throws (via
 * `RasterEffect`'s `reportError`) when WebGPU is unavailable; use `LIC` as
 * the universal-support fallback.
 *
 * Requires the `map` prop. Without one the effect throws.
 *
 * - `length` — Streamline length in steps per direction (forward and backward). Higher values produce longer smears. Default 20.
 * - `stepSize` — Step size in pixels per integration step. Default 1.
 * - `uniformStep` — Walk at a constant step length, ignoring the field's magnitude channel. Default false.
 * - `map` — Required. Vector field as JSX (typically a `Direction`-style encoding).
 *
 * @param props
 * @category Effects
 */
export function LICGpu({
	length = 20,
	stepSize = 1.0,
	uniformStep = false,
	map,
	children,
}: LICGpuProps) {
	const effect = useCallback<RasterEffectCallback>(
		async (target, _apply, mapPixels) => {
			if (mapPixels === undefined) {
				throw new Error("LICGpu requires a map prop providing the vector field")
			}

			return applyLicGpu(target, mapPixels, length, stepSize, uniformStep)
		},
		[length, stepSize, uniformStep],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
