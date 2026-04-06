import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect } from "../RasterEffect"

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

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface SharpenProps extends ComponentPropsWithoutRef<"div"> {
	amount: number
	flatten?: boolean
	children?: ReactNode
}

export function Sharpen({ amount, flatten, children, ...rest }: SharpenProps) {
	const effect = useCallback(
		(pixels: ImageData) => applySharpen(pixels, amount),
		[amount],
	)

	return (
		<RasterEffect effect={effect} flatten={flatten} {...rest}>
			{children}
		</RasterEffect>
	)
}
