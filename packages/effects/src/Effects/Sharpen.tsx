import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { luminance } from "./utils/luminance"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function applySharpen(pixels: ImageData, amount: number): ImageData {
	const { width, height, data: src } = pixels
	const output = new Uint8ClampedArray(src.length)

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const px = (y * width + x) * 4

			const top = Math.max(y - 1, 0)
			const bottom = Math.min(y + 1, height - 1)
			const left = Math.max(x - 1, 0)
			const right = Math.min(x + 1, width - 1)

			const pxTop = (top * width + x) * 4
			const pxBottom = (bottom * width + x) * 4
			const pxLeft = (y * width + left) * 4
			const pxRight = (y * width + right) * 4

			const center = 1 + 4 * amount

			for (let ch = 0; ch < 3; ch++) {
				const weighted =
					center * src[px + ch]! -
					amount * src[pxTop + ch]! -
					amount * src[pxBottom + ch]! -
					amount * src[pxLeft + ch]! -
					amount * src[pxRight + ch]!
				output[px + ch] = Math.min(255, Math.max(0, Math.round(weighted)))
			}

			output[px + 3] = src[px + 3]!
		}
	}

	return new ImageData(output, width, height)
}

export function applyMappedSharpen(pixels: ImageData, map: ImageData, amount: number): ImageData {
	const { width, height, data: src } = pixels
	const mapData = map.data
	const output = new Uint8ClampedArray(src.length)

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const px = (y * width + x) * 4
			const mapLum = luminance(mapData[px]!, mapData[px + 1]!, mapData[px + 2]!) / 255
			const perPixelAmount = mapLum * amount

			const top = Math.max(y - 1, 0)
			const bottom = Math.min(y + 1, height - 1)
			const left = Math.max(x - 1, 0)
			const right = Math.min(x + 1, width - 1)

			const pxTop = (top * width + x) * 4
			const pxBottom = (bottom * width + x) * 4
			const pxLeft = (y * width + left) * 4
			const pxRight = (y * width + right) * 4

			const center = 1 + 4 * perPixelAmount

			for (let ch = 0; ch < 3; ch++) {
				const weighted =
					center * src[px + ch]! -
					perPixelAmount * src[pxTop + ch]! -
					perPixelAmount * src[pxBottom + ch]! -
					perPixelAmount * src[pxLeft + ch]! -
					perPixelAmount * src[pxRight + ch]!
				output[px + ch] = Math.min(255, Math.max(0, Math.round(weighted)))
			}

			output[px + 3] = src[px + 3]!
		}
	}

	return new ImageData(output, width, height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface SharpenProps {
	/** Sharpening strength. Higher values produce more aggressive edge enhancement. */
	amount: number
	map?: ReactNode
	children: ReactNode
}

/**
 * Sharpens the image using a 3x3 unsharp mask convolution.
 *
 * - `amount` — Sharpening strength. Higher values produce more aggressive edge enhancement.
 *
 * @param props
 * @category Effects
 */
export function Sharpen({ amount, map, children }: SharpenProps) {
	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				return applyMappedSharpen(target, mapPixels, amount)
			}

			return applySharpen(target, amount)
		},
		[amount],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
