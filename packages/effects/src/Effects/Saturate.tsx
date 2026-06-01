import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applySaturate(pixels: ImageData, amount: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const red = src[px]!
		const green = src[px + 1]!
		const blue = src[px + 2]!
		const lum = 0.299 * red + 0.587 * green + 0.114 * blue

		output[px] = Math.min(255, Math.max(0, lum + amount * (red - lum)))
		output[px + 1] = Math.min(255, Math.max(0, lum + amount * (green - lum)))
		output[px + 2] = Math.min(255, Math.max(0, lum + amount * (blue - lum)))
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

export function applyMappedSaturate(pixels: ImageData, map: ImageData, amount: number): ImageData {
	const src = pixels.data
	const mapData = map.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const mapLum = (0.299 * mapData[px]! + 0.587 * mapData[px + 1]! + 0.114 * mapData[px + 2]!) / 255
		const effective = 1 + mapLum * (amount - 1)
		const red = src[px]!
		const green = src[px + 1]!
		const blue = src[px + 2]!
		const lum = 0.299 * red + 0.587 * green + 0.114 * blue

		output[px] = Math.min(255, Math.max(0, lum + effective * (red - lum)))
		output[px + 1] = Math.min(255, Math.max(0, lum + effective * (green - lum)))
		output[px + 2] = Math.min(255, Math.max(0, lum + effective * (blue - lum)))
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface SaturateProps {
	amount?: number
	mode?: "parameter" | "mix"
	map?: ReactNode
	children: ReactNode
	version?: string
}

/**
 * Adjusts color saturation by interpolating between grayscale and the original color.
 *
 * - `amount` — Saturation multiplier. 0 is grayscale, 1 is unchanged, greater than 1 oversaturates. Default 1.
 * - `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.
 *
 * @param props
 * @category Effects
 */
export function Saturate({ amount = 1, mode = "mix", map, children, version }: SaturateProps) {
	const internal = `saturate@1+a=${amount}+m=${mode}`
	const composedVersion = version === undefined ? internal : `${internal}+${version}`

	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				if (mode === "parameter") {
					return applyMappedSaturate(target, mapPixels, amount)
				}

				const result = applySaturate(target, amount)

				return mixBlend(target, result, mapPixels)
			}

			return applySaturate(target, amount)
		},
		[amount, mode],
	)

	return (
		<RasterEffect effect={effect} map={map} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
