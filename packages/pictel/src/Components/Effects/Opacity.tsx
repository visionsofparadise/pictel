import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect } from "../RasterEffect"
import { lerp } from "./utils/lerp"
import { luminance } from "./utils/luminance"

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

interface OpacityProps extends ComponentPropsWithoutRef<"div"> {
	amount?: number
	mode?: "parameter" | "mix"
	backdrop?: boolean
	flatten?: boolean
	children?: ReactNode
}

export function Opacity({ amount = 1, mode = "mix", backdrop, flatten, children, ...rest }: OpacityProps) {
	const effect = useCallback(
		(pixels: ImageData) => applyOpacity(pixels, amount),
		[amount],
	)

	const mappedEffect = useCallback(
		(pixels: ImageData, map: ImageData) => applyMappedOpacity(pixels, map, amount),
		[amount],
	)

	return (
		<RasterEffect effect={effect} mappedEffect={mappedEffect} mode={mode} backdrop={backdrop} flatten={flatten} {...rest}>
			{children}
		</RasterEffect>
	)
}
