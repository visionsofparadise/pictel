import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { lerp } from "./utils/lerp"
import { luminance } from "./utils/luminance"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applySaturate(pixels: ImageData, amount: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const lum = luminance(src[px]!, src[px + 1]!, src[px + 2]!)

		output[px] = Math.min(255, Math.max(0, lerp(lum, src[px]!, amount)))
		output[px + 1] = Math.min(255, Math.max(0, lerp(lum, src[px + 1]!, amount)))
		output[px + 2] = Math.min(255, Math.max(0, lerp(lum, src[px + 2]!, amount)))
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

export function applyMappedSaturate(pixels: ImageData, map: ImageData, amount: number): ImageData {
	const src = pixels.data
	const mapData = map.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const mapLum = luminance(mapData[px]!, mapData[px + 1]!, mapData[px + 2]!) / 255
		const effective = lerp(1, amount, mapLum)
		const lum = luminance(src[px]!, src[px + 1]!, src[px + 2]!)

		output[px] = Math.min(255, Math.max(0, lerp(lum, src[px]!, effective)))
		output[px + 1] = Math.min(255, Math.max(0, lerp(lum, src[px + 1]!, effective)))
		output[px + 2] = Math.min(255, Math.max(0, lerp(lum, src[px + 2]!, effective)))
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
}

/**
 * Adjusts color saturation by interpolating between grayscale and the original color.
 *
 * - `amount` — Saturation multiplier. 0 is grayscale, 1 is unchanged, greater than 1 oversaturates. Default 1.
 *
 * @param props
 * @category Effects
 */
export function Saturate({ amount = 1, mode = "mix", map, children }: SaturateProps) {
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
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
