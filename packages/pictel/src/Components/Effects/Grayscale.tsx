import type { ComponentProps } from "react"
import { useCallback } from "react"
import { RasterEffect } from "../RasterEffect"
import { lerp } from "./utils/lerp"
import { luminance } from "./utils/luminance"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applyGrayscale(pixels: ImageData, amount: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const lum = luminance(src[px]!, src[px + 1]!, src[px + 2]!)

		output[px] = lerp(src[px]!, lum, amount)
		output[px + 1] = lerp(src[px + 1]!, lum, amount)
		output[px + 2] = lerp(src[px + 2]!, lum, amount)
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface GrayscaleProps extends ComponentProps<"div"> {
	/** Desaturation amount. 0 is unchanged, 1 is fully grayscale. Default 1. */
	amount?: number
	backdrop?: boolean
	flatten?: boolean
}

/**
 * Converts pixels to grayscale using BT.601 luminance weighting.
 *
 * - `amount` — Desaturation amount. 0 is unchanged, 1 is fully grayscale. Default 1.
 *
 * @param props
 * @category Effects
 */
export function Grayscale({ amount = 1, backdrop, flatten, ...rest }: GrayscaleProps) {
	const effect = useCallback(
		(pixels: ImageData) => applyGrayscale(pixels, amount),
		[amount],
	)

	return (
		<RasterEffect effect={effect} backdrop={backdrop} flatten={flatten} {...rest} />
	)
}
