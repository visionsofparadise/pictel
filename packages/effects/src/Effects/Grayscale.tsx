import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applyGrayscale(pixels: ImageData, amount: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const red = src[px]!
		const green = src[px + 1]!
		const blue = src[px + 2]!
		const lum = 0.299 * red + 0.587 * green + 0.114 * blue

		output[px] = red + amount * (lum - red)
		output[px + 1] = green + amount * (lum - green)
		output[px + 2] = blue + amount * (lum - blue)
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface GrayscaleProps {
	amount?: number
	map?: ReactNode
	children: ReactNode
}

/**
 * Desaturates pixels toward perceptual grayscale.
 *
 * - `amount` — Desaturation amount. 0 is unchanged, 1 is fully grayscale. Default 1.
 *
 * @param props
 * @category Effects
 */
export function Grayscale({ amount = 1, map, children }: GrayscaleProps) {
	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			const result = applyGrayscale(target, amount)

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
