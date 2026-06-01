import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

// Color-weight LUT geometry.
// sumOfSquares = dR² + dG² + dB² ranges over [0, 3 · 255²] = [0, 195075].
// COLOR_LUT_SHIFT = 8 buckets the range with bucket width 256 in sumSq units
// (≈ 16 in per-channel-diff units). 195075 >>> 8 = 762, so a 1024-entry LUT
// covers the full range with headroom. Float32Array is well above the
// precision required at the eventual Uint8 output.
const COLOR_LUT_SHIFT = 8
const COLOR_LUT_SIZE = 1024

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

	// Spatial-weight LUT: (2·radius+1)² Float32 entries, indexed by
	// (dy+radius)·span + (dx+radius). Built once per call.
	const span = 2 * radius + 1
	const spatialLut = new Float32Array(span * span)

	for (let dy = -radius; dy <= radius; dy++) {
		const rowOffset = (dy + radius) * span

		for (let dx = -radius; dx <= radius; dx++) {
			spatialLut[rowOffset + (dx + radius)] =
				spatialDenom === 0 ? (dx === 0 && dy === 0 ? 1 : 0) : Math.exp(-(dx * dx + dy * dy) / spatialDenom)
		}
	}

	// Color-weight LUT: 1024 Float32 entries indexed by (sumSq >>> 8).
	// Bucket centroid is (bucketIdx · 256 + 128); using the centroid keeps
	// the LUT's value within ±half-bucket of the true exp at any sumSq.
	const colorLut = new Float32Array(COLOR_LUT_SIZE)
	const bucketWidth = 1 << COLOR_LUT_SHIFT

	for (let bucket = 0; bucket < COLOR_LUT_SIZE; bucket++) {
		const sumSqMid = bucket * bucketWidth + bucketWidth / 2
		colorLut[bucket] = colorDenom === 0 ? (sumSqMid === 0 ? 1 : 0) : Math.exp(-sumSqMid / colorDenom)
	}

	const colorLutMaxIdx = COLOR_LUT_SIZE - 1

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
				const spatialRow = (dy + radius) * span

				for (let nx = xMin; nx <= xMax; nx++) {
					const dx = nx - x
					const nIdx = (ny * width + nx) * 4
					const nR = src[nIdx]!
					const nG = src[nIdx + 1]!
					const nB = src[nIdx + 2]!

					const spatialWeight = spatialLut[spatialRow + (dx + radius)]!
					const dR = nR - cR
					const dG = nG - cG
					const dB = nB - cB
					const sumSq = dR * dR + dG * dG + dB * dB
					let colorBucket = sumSq >>> COLOR_LUT_SHIFT

					if (colorBucket > colorLutMaxIdx) {
						colorBucket = colorLutMaxIdx
					}

					const colorWeight = colorLut[colorBucket]!
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
	spatialSigma: number
	colorSigma: number
	mode?: "parameter" | "mix"
	map?: ReactNode
	children: ReactNode
	version?: string
}

/**
 * Edge-preserving smoothing. Blurs flat regions while keeping edges crisp — useful
 * as a cel-shading or skin-smoothing primitive. Large `spatialSigma` values are
 * perceptibly slow on large images; keep it under 6 for interactive use.
 *
 * - `spatialSigma` — Spatial radius in pixels. Sensible values are 2–6.
 * - `colorSigma` — Color tolerance in 0–255 units. Larger values bridge more across edges.
 * - `mode` — `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance.
 * - `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.
 *
 * @param props
 * @category Effects
 */
export function Bilateral({
	spatialSigma,
	colorSigma,
	mode = "parameter",
	map,
	children,
	version,
}: BilateralProps) {
	const internal = `bilateral@1+s=${spatialSigma}+c=${colorSigma}+m=${mode}`
	const composedVersion = version === undefined ? internal : `${internal}+${version}`

	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				if (mode === "parameter") {
					return applyMappedBilateral(target, mapPixels, spatialSigma, colorSigma)
				}

				const result = applyBilateral(target, spatialSigma, colorSigma)

				return mixBlend(target, result, mapPixels)
			}

			return applyBilateral(target, spatialSigma, colorSigma)
		},
		[spatialSigma, colorSigma, mode],
	)

	return (
		<RasterEffect effect={effect} map={map} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
