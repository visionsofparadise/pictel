import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { useCallback } from "react"
import { TargetEffect } from "../TargetEffect"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function applyPosterize(pixels: ImageData, levels: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)
	const clamped = Math.max(2, levels)
	const steps = clamped - 1

	for (let px = 0; px < src.length; px += 4) {
		output[px] = Math.round((src[px]! / 255) * steps) / steps * 255
		output[px + 1] = Math.round((src[px + 1]! / 255) * steps) / steps * 255
		output[px + 2] = Math.round((src[px + 2]! / 255) * steps) / steps * 255
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface PosterizeProps extends ComponentPropsWithoutRef<"div"> {
	levels: number
	flatten?: boolean
	children?: ReactNode
}

export function Posterize({ levels, flatten, children, ...rest }: PosterizeProps) {
	const effect = useCallback(
		(pixels: ImageData) => applyPosterize(pixels, levels),
		[levels],
	)

	return (
		<TargetEffect effect={effect} flatten={flatten} {...rest}>
			{children}
		</TargetEffect>
	)
}
