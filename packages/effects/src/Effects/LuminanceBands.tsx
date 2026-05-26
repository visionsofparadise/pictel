import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

const RGB_TO_Y_R = 0.299
const RGB_TO_Y_G = 0.587
const RGB_TO_Y_B = 0.114
const RGB_TO_CB_R = -0.168736
const RGB_TO_CB_G = -0.331264
const RGB_TO_CB_B = 0.5
const RGB_TO_CR_R = 0.5
const RGB_TO_CR_G = -0.418688
const RGB_TO_CR_B = -0.081312
const YCBCR_TO_R_CR = 1.402
const YCBCR_TO_G_CB = -0.344136
const YCBCR_TO_G_CR = -0.714136
const YCBCR_TO_B_CB = 1.772

function quantizeLuminance(yValue: number, bands: number, thresholds?: Array<number>): number {
	const clamped = Math.max(2, bands)

	if (thresholds?.length === clamped - 1) {
		let tier = 0

		for (let index = 0; index < thresholds.length; index++) {
			if (yValue >= thresholds[index]!) tier = index + 1
		}

		const lower = tier === 0 ? 0 : thresholds[tier - 1]!
		const upper = tier === thresholds.length ? 255 : thresholds[tier]!

		return (lower + upper) / 2
	}

	const tier = Math.min(clamped - 1, Math.floor(yValue * clamped / 256))
	const lower = (255 * tier) / clamped
	const upper = (255 * (tier + 1)) / clamped

	return (lower + upper) / 2
}

export function applyLuminanceBands(pixels: ImageData, bands: number, thresholds?: Array<number>): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	const lutY = new Float32Array(256)

	for (let index = 0; index < 256; index++) {
		lutY[index] = quantizeLuminance(index, bands, thresholds)
	}

	for (let px = 0; px < src.length; px += 4) {
		const red = src[px]!
		const green = src[px + 1]!
		const blue = src[px + 2]!

		const y = RGB_TO_Y_R * red + RGB_TO_Y_G * green + RGB_TO_Y_B * blue
		const chromaB = RGB_TO_CB_R * red + RGB_TO_CB_G * green + RGB_TO_CB_B * blue + 128
		const chromaR = RGB_TO_CR_R * red + RGB_TO_CR_G * green + RGB_TO_CR_B * blue + 128

		const yQ = lutY[y | 0]!

		const redOut = yQ + YCBCR_TO_R_CR * (chromaR - 128)
		const greenOut = yQ + YCBCR_TO_G_CB * (chromaB - 128) + YCBCR_TO_G_CR * (chromaR - 128)
		const blueOut = yQ + YCBCR_TO_B_CB * (chromaB - 128)

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

		const y = RGB_TO_Y_R * red + RGB_TO_Y_G * green + RGB_TO_Y_B * blue
		const chromaB = RGB_TO_CB_R * red + RGB_TO_CB_G * green + RGB_TO_CB_B * blue + 128
		const chromaR = RGB_TO_CR_R * red + RGB_TO_CR_G * green + RGB_TO_CR_B * blue + 128

		const yQ = quantizeLuminance(y, bands, thresholds)

		const mapLum = (RGB_TO_Y_R * mapData[px]! + RGB_TO_Y_G * mapData[px + 1]! + RGB_TO_Y_B * mapData[px + 2]!) / 255
		const yMixed = y + (yQ - y) * mapLum

		const redOut = yMixed + YCBCR_TO_R_CR * (chromaR - 128)
		const greenOut = yMixed + YCBCR_TO_G_CB * (chromaB - 128) + YCBCR_TO_G_CR * (chromaR - 128)
		const blueOut = yMixed + YCBCR_TO_B_CB * (chromaB - 128)

		output[px] = Math.round(Math.max(0, Math.min(255, redOut)))
		output[px + 1] = Math.round(Math.max(0, Math.min(255, greenOut)))
		output[px + 2] = Math.round(Math.max(0, Math.min(255, blueOut)))
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface LuminanceBandsProps {
	bands: number
	thresholds?: Array<number>
	mode?: "parameter" | "mix"
	map?: ReactNode
	children: ReactNode
}

/**
 * Quantizes brightness into discrete tiers while leaving color alone — the
 * cel-shading primitive. Output keeps the original color of each pixel and
 * only discretizes its shading.
 *
 * - `bands` — Number of discrete brightness tiers. Minimum 2.
 * - `thresholds` — Optional explicit tier boundaries (length = `bands - 1`, ascending values in `0..255`). Defaults to equal spacing.
 * - `mode` — `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance.
 *
 * @param props
 * @category Effects
 */
export function LuminanceBands({ bands, thresholds, mode, map, children }: LuminanceBandsProps) {
	const resolvedMode = mode ?? "parameter"

	const effect = useCallback<RasterEffectCallback>(
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
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
