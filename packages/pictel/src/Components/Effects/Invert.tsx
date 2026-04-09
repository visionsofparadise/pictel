import type { ComponentProps } from "react"
import { useCallback } from "react"
import { RasterEffect } from "../Pipeline/RasterEffect"
import { lerp } from "./utils/lerp"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applyInvert(pixels: ImageData, amount: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		output[px] = lerp(src[px]!, 255 - src[px]!, amount)
		output[px + 1] = lerp(src[px + 1]!, 255 - src[px + 1]!, amount)
		output[px + 2] = lerp(src[px + 2]!, 255 - src[px + 2]!, amount)
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface InvertProps extends ComponentProps<"div"> {
	/** Inversion amount. 0 is unchanged, 1 is fully inverted. Default 1. */
	amount?: number
	backdrop?: boolean
	flatten?: boolean
}

/**
 * Inverts pixel colors.
 *
 * - `amount` — Inversion amount. 0 is unchanged, 1 is fully inverted. Default 1.
 *
 * @param props
 * @category Effects
 */
export function Invert({ amount = 1, backdrop, flatten, ...rest }: InvertProps) {
	const effect = useCallback(
		(pixels: ImageData) => applyInvert(pixels, amount),
		[amount],
	)

	return (
		<RasterEffect effect={effect} backdrop={backdrop} flatten={flatten} {...rest} />
	)
}
