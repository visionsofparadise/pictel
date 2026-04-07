import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { useCallback } from "react"
import { TargetEffect } from "../TargetEffect"
import { luminance } from "./utils/luminance"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function applyThreshold(pixels: ImageData, threshold: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const lum = luminance(src[px]!, src[px + 1]!, src[px + 2]!)
		const value = lum >= threshold ? 255 : 0
		output[px] = value
		output[px + 1] = value
		output[px + 2] = value
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface ThresholdProps extends ComponentPropsWithoutRef<"div"> {
	threshold: number
	flatten?: boolean
	children?: ReactNode
}

export function Threshold({ threshold, flatten, children, ...rest }: ThresholdProps) {
	const effect = useCallback(
		(pixels: ImageData) => applyThreshold(pixels, threshold),
		[threshold],
	)

	return (
		<TargetEffect effect={effect} flatten={flatten} {...rest}>
			{children}
		</TargetEffect>
	)
}
