import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { averageColor, averageCoverage } from "./utils/average-window"
import { createCanvas } from "./utils/create-canvas"
import { luminance } from "./utils/luminance"
import { mixBlend } from "./utils/mix-blend"

type Context = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

export type HalftoneColorMode = "luminance" | "cmyk" | "color"

function screenChannel(
	context: Context,
	width: number,
	height: number,
	dotSize: number,
	angle: number,
	cell: (sourceCx: number, sourceCy: number, half: number) => { cov: number; color?: [number, number, number] } | null,
): void {
	const rad = (angle * Math.PI) / 180
	const cosA = Math.cos(rad)
	const sinA = Math.sin(rad)
	const cx = width / 2
	const cy = height / 2

	const half = dotSize / 2

	const reach = Math.ceil(Math.hypot(width, height) / 2 / dotSize) + 1

	for (let row = -reach; row <= reach; row++) {
		for (let col = -reach; col <= reach; col++) {
			const dx = col * dotSize
			const dy = row * dotSize
			const lx = cx + dx * cosA - dy * sinA
			const ly = cy + dx * sinA + dy * cosA

			const dot = cell(lx, ly, half)

			if (dot === null) continue

			const radius = dot.cov * half * Math.SQRT2

			if (radius > 0.5) {
				if (dot.color !== undefined) {
					context.fillStyle = `rgb(${Math.round(dot.color[0])}, ${Math.round(dot.color[1])}, ${Math.round(dot.color[2])})`
				}

				context.beginPath()
				context.arc(lx, ly, radius, 0, Math.PI * 2)
				context.fill()
			}
		}
	}
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */

const CMYK_ANGLES = { c: 15, m: 75, y: 0, k: 45 } as const

const CMYK_INKS = {
	c: [0, 255, 255],
	m: [255, 0, 255],
	y: [255, 255, 0],
	k: [0, 0, 0],
} as const

export function applyHalftone(
	pixels: ImageData,
	dotSize: number,
	angle = 0,
	colorMode: HalftoneColorMode = "luminance",
	dotColor: [number, number, number] = [0, 0, 0],
): ImageData {
	const { width, height, data: src } = pixels
	const { context } = createCanvas(width, height)

	context.fillStyle = "#ffffff"
	context.fillRect(0, 0, width, height)

	if (colorMode === "cmyk") {
		context.globalCompositeOperation = "multiply"

		for (const channel of ["c", "m", "y", "k"] as const) {
			const ink = CMYK_INKS[channel]
			context.fillStyle = `rgb(${ink[0]}, ${ink[1]}, ${ink[2]})`

			screenChannel(context, width, height, dotSize, CMYK_ANGLES[channel], (sourceCx, sourceCy, half) => {
				const channelCoverage = averageCoverage(width, height, sourceCx, sourceCy, half, (offset) => {
					const cyan = 1 - src[offset]! / 255
					const magenta = 1 - src[offset + 1]! / 255
					const yellow = 1 - src[offset + 2]! / 255
					const key = Math.min(cyan, magenta, yellow)

					if (channel === "k") return key

					if (key >= 1) return 0

					const denom = 1 - key

					if (channel === "c") return (cyan - key) / denom

					if (channel === "m") return (magenta - key) / denom

					return (yellow - key) / denom
				})

				return channelCoverage === null ? null : { cov: channelCoverage }
			})
		}

		context.globalCompositeOperation = "source-over"

		const result = context.getImageData(0, 0, width, height)

		const out = result.data

		for (let px = 0; px < src.length; px += 4) {
			out[px + 3] = src[px + 3]!
		}

		return new ImageData(out, width, height)
	}

	if (colorMode === "color") {
		screenChannel(context, width, height, dotSize, angle, (sourceCx, sourceCy, half) => {
			const avg = averageColor(width, height, sourceCx, sourceCy, half, src)

			if (avg === null) return null

			const cov = 1 - luminance(avg[0], avg[1], avg[2]) / 255

			return { cov, color: avg }
		})

		const colorResult = context.getImageData(0, 0, width, height)
		const colorOut = colorResult.data

		for (let px = 0; px < src.length; px += 4) {
			colorOut[px + 3] = src[px + 3]!
		}

		return new ImageData(colorOut, width, height)
	}

	context.fillStyle = `rgb(${dotColor[0]}, ${dotColor[1]}, ${dotColor[2]})`

	screenChannel(context, width, height, dotSize, angle, (sourceCx, sourceCy, half) => {
		const avgLum = averageCoverage(width, height, sourceCx, sourceCy, half, (offset) =>
			luminance(src[offset]!, src[offset + 1]!, src[offset + 2]!),
		)

		if (avgLum === null) return null

		return { cov: 1 - avgLum / 255 }
	})

	return context.getImageData(0, 0, width, height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface HalftoneProps {
	/** Grid cell size in pixels. Larger values produce coarser halftone. */
	dotSize: number
	/** Rotation angle of the dot grid in degrees — `"luminance"` and `"color"` modes only. Default 0. */
	angle?: number
	/**
	 * Color mode for the screen. Default `"luminance"`.
	 * - `"luminance"` — monochrome screen: dot radius from per-cell luminance, dots stamped in `dotColor` on white.
	 * - `"cmyk"` — process halftone: the image is separated into Cyan/Magenta/Yellow/Key channels, each screened on its own grid at a classic process angle (C 15°, M 75°, Y 0°, K 45°), dots stamped in ink color and overprinted via multiply so overlapping colored dots reproduce color.
	 * - `"color"` — single-screen color halftone: one shared grid, each cell a single dot in that cell's own average color sized by darkness. No overlapping screens, so nothing can misregister — the clean comic-dot look.
	 */
	colorMode?: HalftoneColorMode
	/** Ink color `[r, g, b]` (0-255) for the `"luminance"` screen — lets monochrome mode stamp a colored Ben-Day screen. Ignored in `"cmyk"` mode. Default black `[0, 0, 0]`. */
	dotColor?: [number, number, number]
	map?: ReactNode
	children: ReactNode
}

/**
 * Converts the image to a dot-screen halftone. Three flavors:
 *
 * - `"luminance"` (default) — monochrome Ben-Day screen: dot radius varies
 *   with local luminance, dots are stamped in `dotColor` on white.
 * - `"cmyk"` — true process halftone: Cyan, Magenta, Yellow, and Key are each
 *   screened on their own grid at the classic process angles (Cyan 15°,
 *   Magenta 75°, Yellow 0°, Key 45°) and overprinted — the look of CMYK
 *   newsprint where colour emerges from overlapping colored dots.
 * - `"color"` — single-screen color halftone: one shared grid, each cell a
 *   dot in that cell's own average color. No overlapping screens, so the
 *   pattern can't misregister — the clean comic-dot look. Reach for this in
 *   pop-art treatments.
 *
 * - `dotSize` — Grid cell size in pixels. Larger values produce coarser halftone.
 * - `angle` — Rotation of the dot grid in degrees (`"luminance"` / `"color"` modes only). Default 0.
 * - `colorMode` — `"luminance"` (default), `"cmyk"`, or `"color"`.
 * - `dotColor` — Ink color `[r, g, b]` for the `"luminance"` screen. Default black `[0, 0, 0]`.
 *
 * @param props
 * @category Effects
 */
export function Halftone({ dotSize, angle, colorMode = "luminance", dotColor = [0, 0, 0], map, children }: HalftoneProps) {
	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			const result = applyHalftone(target, dotSize, angle, colorMode, dotColor)

			if (mapPixels !== undefined) {
				return mixBlend(target, result, mapPixels)
			}

			return result
		},
		[dotSize, angle, colorMode, dotColor],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
