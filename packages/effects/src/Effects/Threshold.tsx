import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { luminance } from "./utils/luminance"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function applyThreshold(pixels: ImageData, threshold: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const lum = luminance(src[px]!, src[px + 1]!, src[px + 2]!)
		const value = lum >= threshold ? 255 : 0
		output[px] = value
		output[px + 1] = value
		output[px + 2] = value
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

export function applyMappedThreshold(pixels: ImageData, map: ImageData, level: number): ImageData {
	const src = pixels.data
	const mapData = map.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const mapLum = luminance(mapData[px]!, mapData[px + 1]!, mapData[px + 2]!) / 255
		const perPixelThreshold = mapLum * level
		const lum = luminance(src[px]!, src[px + 1]!, src[px + 2]!)
		const value = lum >= perPixelThreshold ? 255 : 0
		output[px] = value
		output[px + 1] = value
		output[px + 2] = value
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface ThresholdProps {
	threshold: number
	map?: ReactNode
	children: ReactNode
}

/**
 * Converts each pixel to pure black or white based on a luminance threshold.
 *
 * - `threshold` — Luminance threshold (0-255). Pixels at or above become white.
 *
 * @param props
 * @category Effects
 */
export function Threshold({ threshold, map, children }: ThresholdProps) {
	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				return applyMappedThreshold(target, mapPixels, threshold)
			}

			return applyThreshold(target, threshold)
		},
		[threshold],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
