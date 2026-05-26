import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { lerp } from "./utils/lerp"
import { luminance } from "./utils/luminance"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applyOpacity(pixels: ImageData, amount: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		output[px] = src[px]!
		output[px + 1] = src[px + 1]!
		output[px + 2] = src[px + 2]!
		output[px + 3] = Math.min(255, Math.max(0, src[px + 3]! * amount))
	}

	return new ImageData(output, pixels.width, pixels.height)
}

export function applyMappedOpacity(pixels: ImageData, map: ImageData, amount: number): ImageData {
	const src = pixels.data
	const mapData = map.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const mapLum = luminance(mapData[px]!, mapData[px + 1]!, mapData[px + 2]!) / 255
		const effective = lerp(1, amount, mapLum)

		output[px] = src[px]!
		output[px + 1] = src[px + 1]!
		output[px + 2] = src[px + 2]!
		output[px + 3] = Math.min(255, Math.max(0, src[px + 3]! * effective))
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface OpacityProps {
	/** Opacity multiplier. 1 is unchanged, 0 is fully transparent. Default 1. */
	amount?: number
	mode?: "parameter" | "mix"
	map?: ReactNode
	children: ReactNode
}

/**
 * Adjusts pixel opacity by scaling the alpha channel.
 *
 * - `amount` — Opacity multiplier. 1 is unchanged, 0 is fully transparent. Default 1.
 *
 * @param props
 * @category Effects
 */
export function Opacity({ amount = 1, mode = "mix", map, children }: OpacityProps) {
	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				if (mode === "parameter") {
					return applyMappedOpacity(target, mapPixels, amount)
				}

				const result = applyOpacity(target, amount)

				return mixBlend(target, result, mapPixels)
			}

			return applyOpacity(target, amount)
		},
		[amount, mode],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
