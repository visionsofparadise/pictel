import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"

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

interface DisplacementMapProps {
	scaleX?: number
	scaleY?: number
	map?: ReactNode
	children: ReactNode
}

/**
 * Displaces pixels using the `map` prop's red and green channels for X and Y offset.
 * Supply a `map` prop providing the displacement source.
 *
 * - `scaleX` — Maximum horizontal displacement in pixels. Default 20.
 * - `scaleY` — Maximum vertical displacement in pixels. Default 20.
 *
 * @param props
 * @category Effects
 */
export function DisplacementMap({
	scaleX = 20,
	scaleY = 20,
	map,
	children,
}: DisplacementMapProps) {
	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				return applyDisplacement(target, mapPixels, scaleX, scaleY)
			}

			return target
		},
		[scaleX, scaleY],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
