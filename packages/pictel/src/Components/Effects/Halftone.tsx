import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect } from "../Pipeline/RasterEffect"
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
	const cosA = Math.cos(rad)
	const sinA = Math.sin(rad)
	const cx = width / 2
	const cy = height / 2

	// Iterate the dot grid in rotated screen space. Oversize the iteration
	// extent so rotated cells covering the image corners aren't missed.
	const expand = angle !== 0 ? Math.ceil(Math.hypot(width, height) - Math.min(width, height)) / 2 : 0
	const startX = -expand
	const startY = -expand
	const endX = width + expand
	const endY = height + expand

	context.fillStyle = "#000000"

	for (let cellY = startY; cellY < endY; cellY += dotSize) {
		for (let cellX = startX; cellX < endX; cellX += dotSize) {
			// Screen-space cell center.
			const sx = cellX + dotSize / 2
			const sy = cellY + dotSize / 2

			// Rotate the screen-space cell center back into source-image space
			// (rotation by -angle around the image center).
			const dx = sx - cx
			const dy = sy - cy
			const sourceCxF = cx + dx * cosA + dy * sinA
			const sourceCyF = cy - dx * sinA + dy * cosA

			// Sample a dotSize-sized neighborhood around the source-space cell
			// center, clamped to image bounds. If the entire window falls
			// outside the source, treat it as white (no dot).
			const sampleStartX = Math.max(0, Math.floor(sourceCxF - dotSize / 2))
			const sampleStartY = Math.max(0, Math.floor(sourceCyF - dotSize / 2))
			const sampleEndX = Math.min(width, Math.ceil(sourceCxF + dotSize / 2))
			const sampleEndY = Math.min(height, Math.ceil(sourceCyF + dotSize / 2))

			let lumSum = 0
			let count = 0

			for (let pixelY = sampleStartY; pixelY < sampleEndY; pixelY++) {
				for (let pixelX = sampleStartX; pixelX < sampleEndX; pixelX++) {
					const offset = (pixelY * width + pixelX) * 4
					lumSum += luminance(src[offset]!, src[offset + 1]!, src[offset + 2]!)
					count++
				}
			}

			// No source coverage — falls back to white (no dot).
			if (count === 0) continue

			const avgLum = lumSum / count
			const radius = (1 - avgLum / 255) * (dotSize / 2)

			if (radius > 0.5) {
				// Draw at the unrotated screen-space cell center.
				context.beginPath()
				context.arc(sx, sy, radius, 0, Math.PI * 2)
				context.fill()
			}
		}
	}

	return context.getImageData(0, 0, width, height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface HalftoneProps {
	/** Grid cell size in pixels. Larger values produce coarser halftone. */
	dotSize: number
	/** Rotation angle of the dot grid in degrees. Default 0. */
	angle?: number
	backdrop?: boolean
	children: ReactNode
}

/**
 * Converts the image to a halftone pattern. Dot radius varies with local luminance.
 *
 * - `dotSize` — Grid cell size in pixels. Larger values produce coarser halftone.
 * - `angle` — Rotation angle of the dot grid in degrees. Default 0.
 *
 * @param props
 * @category Effects
 */
export function Halftone({ dotSize, angle, backdrop, children }: HalftoneProps) {
	const effect = useCallback(
		(pixels: ImageData) => applyHalftone(pixels, dotSize, angle),
		[dotSize, angle],
	)

	return (
		<RasterEffect effect={effect} backdrop={backdrop}>
			{children}
		</RasterEffect>
	)
}
