import { useCallback, type ComponentPropsWithoutRef, type ReactNode } from "react"
import { RasterEffect } from "../RasterEffect"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function applyDisplacement(
	pixels: ImageData,
	map: ImageData,
	scaleX: number,
	scaleY: number,
): ImageData {
	const { width, height, data: src } = pixels
	const { width: mapWidth, height: mapHeight, data: mapPixels } = map
	const output = new Uint8ClampedArray(src.length)

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const mapX = Math.floor((x / width) * mapWidth)
			const mapY = Math.floor((y / height) * mapHeight)
			const mapIdx = (mapY * mapWidth + mapX) * 4

			const mapR = mapPixels[mapIdx]!
			const mapG = mapPixels[mapIdx + 1]!

			const dx = ((mapR - 128) / 128) * scaleX
			const dy = ((mapG - 128) / 128) * scaleY

			const srcX = Math.min(Math.max(Math.floor(x + dx), 0), width - 1)
			const srcY = Math.min(Math.max(Math.floor(y + dy), 0), height - 1)
			const srcIdx = (srcY * width + srcX) * 4

			const outIdx = (y * width + x) * 4
			output[outIdx] = src[srcIdx]!
			output[outIdx + 1] = src[srcIdx + 1]!
			output[outIdx + 2] = src[srcIdx + 2]!
			output[outIdx + 3] = src[srcIdx + 3]!
		}
	}

	return new ImageData(output, width, height)
}
/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface DisplacementMapProps extends ComponentPropsWithoutRef<"div"> {
	scaleX?: number
	scaleY?: number
	backdrop?: boolean
	flatten?: boolean
	children?: ReactNode
}

export function DisplacementMap({
	scaleX = 20,
	scaleY = 20,
	backdrop,
	flatten,
	children,
	...rest
}: DisplacementMapProps) {
	const effect = useCallback(
		(pixels: ImageData) => pixels,
		[],
	)

	const mappedEffect = useCallback(
		(pixels: ImageData, map: ImageData) => applyDisplacement(pixels, map, scaleX, scaleY),
		[scaleX, scaleY],
	)

	return (
		<RasterEffect effect={effect} mappedEffect={mappedEffect} mode="parameter" backdrop={backdrop} flatten={flatten} {...rest}>
			{children}
		</RasterEffect>
	)
}
