import { useCallback, useEffect, useState, type ComponentPropsWithoutRef, type ReactNode } from "react"
import { TargetEffect } from "../TargetEffect"

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
	map: string
	scaleX?: number
	scaleY?: number
	flatten?: boolean
	children?: ReactNode
}

export function DisplacementMap({
	map: mapSrc,
	scaleX = 20,
	scaleY = 20,
	flatten,
	children,
	...rest
}: DisplacementMapProps) {
	const [mapData, setMapData] = useState<ImageData | null>(null)

	useEffect(() => {
		let cancelled = false
		const img = new Image()
		img.crossOrigin = "anonymous"
		img.onload = () => {
			if (cancelled) return

			const canvas = document.createElement("canvas")
			canvas.width = img.width
			canvas.height = img.height
			const context = canvas.getContext("2d")

			if (!context) return

			context.drawImage(img, 0, 0)
			setMapData(context.getImageData(0, 0, img.width, img.height))
		}
		img.onerror = () => {
			if (!cancelled) setMapData(null)
		}
		img.src = mapSrc

		return () => {
			cancelled = true
		}
	}, [mapSrc])

	const effect = useCallback(
		(pixels: ImageData) => (mapData ? applyDisplacement(pixels, mapData, scaleX, scaleY) : pixels),
		[mapData, scaleX, scaleY],
	)

	return (
		<TargetEffect effect={effect} flatten={flatten} {...rest}>
			{children}
		</TargetEffect>
	)
}
