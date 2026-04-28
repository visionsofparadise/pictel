import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect } from "../Pipeline/RasterEffect"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applyBilateral(
	pixels: ImageData,
	spatialSigma: number,
	colorSigma: number,
): ImageData {
	const { width, height, data: src } = pixels
	const output = new Uint8ClampedArray(src.length)

	const radius = Math.max(0, Math.ceil(spatialSigma * 2))
	const spatialDenom = 2 * spatialSigma * spatialSigma
	const colorDenom = 2 * colorSigma * colorSigma

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const cIdx = (y * width + x) * 4
			const cR = src[cIdx]!
			const cG = src[cIdx + 1]!
			const cB = src[cIdx + 2]!

			let weightSum = 0
			let rSum = 0
			let gSum = 0
			let bSum = 0

			const yMin = Math.max(0, y - radius)
			const yMax = Math.min(height - 1, y + radius)
			const xMin = Math.max(0, x - radius)
			const xMax = Math.min(width - 1, x + radius)

			for (let ny = yMin; ny <= yMax; ny++) {
				const dy = ny - y

				for (let nx = xMin; nx <= xMax; nx++) {
					const dx = nx - x
					const nIdx = (ny * width + nx) * 4
					const nR = src[nIdx]!
					const nG = src[nIdx + 1]!
					const nB = src[nIdx + 2]!

					const spatialWeight = Math.exp(-(dx * dx + dy * dy) / spatialDenom)
					const dR = nR - cR
					const dG = nG - cG
					const dB = nB - cB
					const colorWeight = Math.exp(-(dR * dR + dG * dG + dB * dB) / colorDenom)
					const weight = spatialWeight * colorWeight

					weightSum += weight
					rSum += weight * nR
					gSum += weight * nG
					bSum += weight * nB
				}
			}

			output[cIdx] = Math.round(rSum / weightSum)
			output[cIdx + 1] = Math.round(gSum / weightSum)
			output[cIdx + 2] = Math.round(bSum / weightSum)
			output[cIdx + 3] = src[cIdx + 3]!
		}
	}

	return new ImageData(output, width, height)
}

export function applyMappedBilateral(
	pixels: ImageData,
	map: ImageData,
	spatialSigma: number,
	colorSigma: number,
): ImageData {
	const filtered = applyBilateral(pixels, spatialSigma, colorSigma)

	return mixBlend(pixels, filtered, map)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface BilateralProps {
	/** Spatial radius in pixels (Gaussian sigma). Sensible values are 2–6; larger values are slow. */
	spatialSigma: number
	/** Color tolerance in 0–255 units. Larger values bridge more across edges. */
	colorSigma: number
	/** `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance. */
	mode?: "parameter" | "mix"
	backdrop?: boolean
	children: ReactNode
}

/**
 * Edge-preserving smoothing via the bilateral filter — Gaussian-weighted average
 * where the weight depends on both spatial distance and color distance, so pixels
 * across edges (large color difference) do not blend together.
 *
 * - `spatialSigma` — Spatial radius in pixels. Sensible values are 2–6.
 * - `colorSigma` — Color tolerance in 0–255 units. Larger values bridge more across edges.
 *
 * Cost is `O(W * H * r²)` where `r = ceil(2 * spatialSigma)`. Large `spatialSigma`
 * values are perceptibly slow on large images.
 *
 * @param props
 * @category Effects
 */
export function Bilateral({
	spatialSigma,
	colorSigma,
	mode = "parameter",
	backdrop,
	children,
}: BilateralProps) {
	const effect = useCallback(
		(pixels: ImageData) => applyBilateral(pixels, spatialSigma, colorSigma),
		[spatialSigma, colorSigma],
	)

	const mappedEffect = useCallback(
		(pixels: ImageData, map: ImageData) =>
			applyMappedBilateral(pixels, map, spatialSigma, colorSigma),
		[spatialSigma, colorSigma],
	)

	return (
		<RasterEffect
			effect={effect}
			mappedEffect={mappedEffect}
			mode={mode}
			backdrop={backdrop}
		>
			{children}
		</RasterEffect>
	)
}
