import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect } from "../RasterEffect"
import { luminance } from "./utils/luminance"

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

export function applyMappedPosterize(pixels: ImageData, map: ImageData, levels: number): ImageData {
	const src = pixels.data
	const mapData = map.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const mapLum = luminance(mapData[px]!, mapData[px + 1]!, mapData[px + 2]!) / 255
		const perPixelLevels = Math.max(2, Math.round(2 + mapLum * (levels - 2)))
		const steps = perPixelLevels - 1

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
	backdrop?: boolean
	flatten?: boolean
	children?: ReactNode
}

export function Posterize({ levels, backdrop, flatten, children, ...rest }: PosterizeProps) {
	const effect = useCallback(
		(pixels: ImageData) => applyPosterize(pixels, levels),
		[levels],
	)

	const mappedEffect = useCallback(
		(pixels: ImageData, map: ImageData) => applyMappedPosterize(pixels, map, levels),
		[levels],
	)

	return (
		<RasterEffect effect={effect} mappedEffect={mappedEffect} mode="parameter" backdrop={backdrop} flatten={flatten} {...rest}>
			{children}
		</RasterEffect>
	)
}
