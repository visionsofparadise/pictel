import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect } from "../RasterEffect"
import { luminance } from "./utils/luminance"

function createCanvas(width: number, height: number): { canvas: OffscreenCanvas | HTMLCanvasElement; context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D } {
	if (typeof OffscreenCanvas !== "undefined") {
		const canvas = new OffscreenCanvas(width, height)
		const context = canvas.getContext("2d")

		if (!context) throw new Error("Failed to get 2d context from OffscreenCanvas")

		return { canvas, context }
	}

	const canvas = document.createElement("canvas")
	canvas.width = width
	canvas.height = height
	const context = canvas.getContext("2d")

	if (!context) throw new Error("Failed to get 2d context from canvas")

	return { canvas, context }
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function applyHalftone(pixels: ImageData, dotSize: number, angle = 0): ImageData {
	const { width, height, data: src } = pixels
	const { context } = createCanvas(width, height)

	context.fillStyle = "#ffffff"
	context.fillRect(0, 0, width, height)

	const rad = (angle * Math.PI) / 180

	if (angle !== 0) {
		context.translate(width / 2, height / 2)
		context.rotate(rad)
		context.translate(-width / 2, -height / 2)
	}

	const expand = angle !== 0 ? Math.ceil(Math.hypot(width, height) - Math.min(width, height)) / 2 : 0
	const startX = -expand
	const startY = -expand
	const endX = width + expand
	const endY = height + expand

	context.fillStyle = "#000000"

	for (let cellY = startY; cellY < endY; cellY += dotSize) {
		for (let cellX = startX; cellX < endX; cellX += dotSize) {
			let lumSum = 0
			let count = 0

			const sampleStartX = Math.max(0, Math.floor(cellX))
			const sampleStartY = Math.max(0, Math.floor(cellY))
			const sampleEndX = Math.min(width, Math.ceil(cellX + dotSize))
			const sampleEndY = Math.min(height, Math.ceil(cellY + dotSize))

			for (let sy = sampleStartY; sy < sampleEndY; sy++) {
				for (let sx = sampleStartX; sx < sampleEndX; sx++) {
					const px = (sy * width + sx) * 4
					lumSum += luminance(src[px]!, src[px + 1]!, src[px + 2]!)
					count++
				}
			}

			if (count === 0) continue

			const avgLum = lumSum / count
			const radius = (1 - avgLum / 255) * (dotSize / 2)

			if (radius > 0.5) {
				const dotCx = cellX + dotSize / 2
				const dotCy = cellY + dotSize / 2
				context.beginPath()
				context.arc(dotCx, dotCy, radius, 0, Math.PI * 2)
				context.fill()
			}
		}
	}

	return context.getImageData(0, 0, width, height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface HalftoneProps extends ComponentPropsWithoutRef<"div"> {
	dotSize: number
	angle?: number
	backdrop?: boolean
	flatten?: boolean
	children?: ReactNode
}

export function Halftone({ dotSize, angle, backdrop, flatten, children, ...rest }: HalftoneProps) {
	const effect = useCallback(
		(pixels: ImageData) => applyHalftone(pixels, dotSize, angle),
		[dotSize, angle],
	)

	return (
		<RasterEffect effect={effect} backdrop={backdrop} flatten={flatten} {...rest}>
			{children}
		</RasterEffect>
	)
}
