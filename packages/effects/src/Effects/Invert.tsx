import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { lerp } from "./utils/lerp"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applyInvert(pixels: ImageData, amount: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	const lut = new Uint8ClampedArray(256)

	for (let index = 0; index < 256; index++) {
		lut[index] = lerp(index, 255 - index, amount)
	}

	for (let px = 0; px < src.length; px += 4) {
		output[px] = lut[src[px]!]!
		output[px + 1] = lut[src[px + 1]!]!
		output[px + 2] = lut[src[px + 2]!]!
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface InvertProps {
	amount?: number
	map?: ReactNode
	children: ReactNode
}

/**
 * Inverts pixel colors.
 *
 * - `amount` — Inversion amount. 0 is unchanged, 1 is fully inverted. Default 1.
 *
 * @param props
 * @category Effects
 */
export function Invert({ amount = 1, map, children }: InvertProps) {
	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			const result = applyInvert(target, amount)

			if (mapPixels !== undefined) {
				return mixBlend(target, result, mapPixels)
			}

			return result
		},
		[amount],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
