import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { lerp } from "./utils/lerp"
import { luminance } from "./utils/luminance"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applyContrast(pixels: ImageData, amount: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		output[px] = Math.min(255, Math.max(0, ((src[px]! / 255 - 0.5) * amount + 0.5) * 255))
		output[px + 1] = Math.min(255, Math.max(0, ((src[px + 1]! / 255 - 0.5) * amount + 0.5) * 255))
		output[px + 2] = Math.min(255, Math.max(0, ((src[px + 2]! / 255 - 0.5) * amount + 0.5) * 255))
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

export function applyMappedContrast(pixels: ImageData, map: ImageData, amount: number): ImageData {
	const src = pixels.data
	const mapData = map.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const mapLum = luminance(mapData[px]!, mapData[px + 1]!, mapData[px + 2]!) / 255
		const effective = lerp(1, amount, mapLum)

		output[px] = Math.min(255, Math.max(0, ((src[px]! / 255 - 0.5) * effective + 0.5) * 255))
		output[px + 1] = Math.min(255, Math.max(0, ((src[px + 1]! / 255 - 0.5) * effective + 0.5) * 255))
		output[px + 2] = Math.min(255, Math.max(0, ((src[px + 2]! / 255 - 0.5) * effective + 0.5) * 255))
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface ContrastProps {
	amount?: number
	mode?: "parameter" | "mix"
	map?: ReactNode
	children: ReactNode
}

/**
 * Adjusts pixel contrast by scaling deviation from mid-gray.
 *
 * - `amount` — Contrast multiplier. 1 is unchanged, 0 is flat gray, greater than 1 increases contrast.
 *
 * @param props
 * @category Effects
 */
export function Contrast({ amount = 1, mode = "mix", map, children }: ContrastProps) {
	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				if (mode === "parameter") {
					return applyMappedContrast(target, mapPixels, amount)
				}

				const result = applyContrast(target, amount)

				return mixBlend(target, result, mapPixels)
			}

			return applyContrast(target, amount)
		},
		[amount, mode],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
