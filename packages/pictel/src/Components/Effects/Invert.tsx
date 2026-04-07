import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect } from "../RasterEffect"
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

interface InvertProps extends ComponentPropsWithoutRef<"div"> {
	amount?: number
	mode?: "parameter" | "mix"
	backdrop?: boolean
	flatten?: boolean
	children?: ReactNode
}

export function Invert({ amount = 1, mode = "mix", backdrop, flatten, children, ...rest }: InvertProps) {
	const effect = useCallback(
		(pixels: ImageData) => applyInvert(pixels, amount),
		[amount],
	)

	return (
		<RasterEffect effect={effect} mode={mode} backdrop={backdrop} flatten={flatten} {...rest}>
			{children}
		</RasterEffect>
	)
}
