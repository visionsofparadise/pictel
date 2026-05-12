import type { ReactNode } from "react"
import { useCallback } from "react"
import { Pipeline, type PipelineCallback } from "../Pipeline/Pipeline"
import { luminance } from "./utils/luminance"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

function quantizeLuminance(yValue: number, bands: number, thresholds?: Array<number>): number {
	const clamped = Math.max(2, bands)

	if (thresholds?.length === clamped - 1) {
		// Find tier index: number of thresholds yValue is >=
		let tier = 0

		for (let index = 0; index < thresholds.length; index++) {
			if (yValue >= thresholds[index]!) tier = index + 1
		}

		const lower = tier === 0 ? 0 : thresholds[tier - 1]!
		const upper = tier === thresholds.length ? 255 : thresholds[tier]!

		return (lower + upper) / 2
	}

	// Equal spacing: boundaries at 255 * (i+1) / bands for i in 0..bands-2
	const tier = Math.min(clamped - 1, Math.floor(yValue * clamped / 256))
	const lower = (255 * tier) / clamped
	const upper = (255 * (tier + 1)) / clamped

	return (lower + upper) / 2
}

export function applyLuminanceBands(pixels: ImageData, bands: number, thresholds?: Array<number>): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const red = src[px]!
		const green = src[px + 1]!
		const blue = src[px + 2]!

		const y = 0.299 * red + 0.587 * green + 0.114 * blue
		const chromaB = -0.168736 * red - 0.331264 * green + 0.5 * blue + 128
		const chromaR = 0.5 * red - 0.418688 * green - 0.081312 * blue + 128

		const yQ = quantizeLuminance(y, bands, thresholds)

		const redOut = yQ + 1.402 * (chromaR - 128)
		const greenOut = yQ - 0.344136 * (chromaB - 128) - 0.714136 * (chromaR - 128)
		const blueOut = yQ + 1.772 * (chromaB - 128)

		output[px] = Math.round(Math.max(0, Math.min(255, redOut)))
		output[px + 1] = Math.round(Math.max(0, Math.min(255, greenOut)))
		output[px + 2] = Math.round(Math.max(0, Math.min(255, blueOut)))
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

export function applyMappedLuminanceBands(pixels: ImageData, map: ImageData, bands: number, thresholds?: Array<number>): ImageData {
	const src = pixels.data
	const mapData = map.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const red = src[px]!
		const green = src[px + 1]!
		const blue = src[px + 2]!

		const y = 0.299 * red + 0.587 * green + 0.114 * blue
		const chromaB = -0.168736 * red - 0.331264 * green + 0.5 * blue + 128
		const chromaR = 0.5 * red - 0.418688 * green - 0.081312 * blue + 128

		const yQ = quantizeLuminance(y, bands, thresholds)

		// Map's luminance modulates strength: lerp between original Y and quantized Y.
		const mapLum = luminance(mapData[px]!, mapData[px + 1]!, mapData[px + 2]!) / 255
		const yMixed = y + (yQ - y) * mapLum

		const redOut = yMixed + 1.402 * (chromaR - 128)
		const greenOut = yMixed - 0.344136 * (chromaB - 128) - 0.714136 * (chromaR - 128)
		const blueOut = yMixed + 1.772 * (chromaB - 128)

		output[px] = Math.round(Math.max(0, Math.min(255, redOut)))
		output[px + 1] = Math.round(Math.max(0, Math.min(255, greenOut)))
		output[px + 2] = Math.round(Math.max(0, Math.min(255, blueOut)))
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface LuminanceBandsProps {
	/** Number of discrete luminance tiers. Minimum 2. */
	bands: number
	/** Optional explicit tier boundaries (length = bands - 1, ascending values in 0..255). */
	thresholds?: Array<number>
	mode?: "parameter" | "mix"
	map?: ReactNode
	children: ReactNode
}

/**
 * Quantizes luminance into discrete tiers while preserving chrominance, the cel-shading primitive.
 *
 * Splits each pixel into YCbCr (ITU-R BT.601), quantizes Y into `bands` tiers, then recombines
 * with the original Cb/Cr. Output keeps original color, discretizes shading.
 *
 * - `bands` — Number of discrete luminance tiers. Minimum 2.
 * - `thresholds` — Optional explicit tier boundaries (length = bands - 1, ascending values in 0..255). Defaults to equal spacing.
 *
 * @param props
 * @category Effects
 */
export function LuminanceBands({ bands, thresholds, mode, map, children }: LuminanceBandsProps) {
	const resolvedMode = mode ?? "parameter"

	const effect = useCallback<PipelineCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				if (resolvedMode === "parameter") {
					return applyMappedLuminanceBands(target, mapPixels, bands, thresholds)
				}

				const result = applyLuminanceBands(target, bands, thresholds)

				return mixBlend(target, result, mapPixels)
			}

			return applyLuminanceBands(target, bands, thresholds)
		},
		[bands, thresholds, resolvedMode],
	)

	return (
		<Pipeline effect={effect} map={map}>
			{children}
		</Pipeline>
	)
}
