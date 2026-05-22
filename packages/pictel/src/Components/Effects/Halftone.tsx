import type { ReactNode } from "react"
import { useCallback } from "react"
import { Pipeline, type PipelineCallback } from "../Pipeline/Pipeline"
import { luminance } from "./utils/luminance"
import { mixBlend } from "./utils/mix-blend"

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

type Context = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

/** Color mode for the halftone screen. */
export type HalftoneColorMode = "luminance" | "cmyk" | "color"

/**
 * Stamp one rotated halftone screen onto `context`.
 *
 * Only the dot lattice rotates, never the image. The cell grid is anchored so
 * one cell sits exactly on the image center; each cell's offset from that
 * center is rotated by `angle` to get the dot's lattice position; coverage is
 * then both *sampled* and the dot *drawn* at that same rotated point. Sampling
 * and drawing at one point keeps the photo content fixed while the lattice
 * spins under it. Anchoring every channel's grid to the shared center cell
 * makes all four CMYK screens rotate about one coincident point, so they
 * overprint into a locked rosette instead of drifting into moiré.
 *
 * The `cell(cx, cy, half)` callback returns the dot for the cell at the given
 * image-space point: its `cov` in [0, 1] and an optional per-dot `color`
 * `[r, g, b]` (when omitted, the caller's current `fillStyle` is used). It
 * returns `null` when the sample window falls entirely outside the source
 * (treated as no dot).
 */
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

	// Anchor every channel's lattice to a shared cell on the image center — a
	// cell sits at (cx, cy) and the rest step out from it by `dotSize`. All
	// four CMYK screens then rotate about that one coincident point, so they
	// overprint into a locked rosette rather than drifting into moiré.
	// `reach` covers the image corners for any rotation angle.
	const reach = Math.ceil(Math.hypot(width, height) / 2 / dotSize) + 1

	for (let row = -reach; row <= reach; row++) {
		for (let col = -reach; col <= reach; col++) {
			// Cell offset from the shared center cell, rotated by +angle to the
			// dot's lattice position. Coverage is sampled AND the dot is drawn
			// at this point, so only the lattice rotates — the image stays put.
			const dx = col * dotSize
			const dy = row * dotSize
			const lx = cx + dx * cosA - dy * sinA
			const ly = cy + dx * sinA + dy * cosA

			const dot = cell(lx, ly, half)

			// No source coverage — falls back to background (no dot).
			if (dot === null) continue

			// Scale to the cell half-diagonal (half * √2): a full-coverage dot
			// must reach the cell corners so saturated cells ink fully solid and
			// neighbouring dots merge. An inscribed `cov * half` circle tops out
			// at ~78% cell coverage and never merges, leaving the dot grid
			// permanently visible.
			const radius = dot.cov * half * Math.SQRT2

			if (radius > 0.5) {
				// A per-dot color (single-screen `"color"` mode) overrides the
				// caller's fixed fillStyle; channel modes leave it untouched.
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

/** Half-open pixel rectangle `[startX, endX) × [startY, endY)`. */
export interface SampleWindow {
	startX: number
	startY: number
	endX: number
	endY: number
}

/**
 * The pixel rectangle a halftone cell samples coverage from, for a dot whose
 * center sits at `(sourceCx, sourceCy)` in source space.
 *
 * The window is anchored on the pixel nearest the dot center (`round`, not
 * `floor`/`ceil`) and given a fixed `2 * half`-pixel span, so — before any
 * edge clamp — it is always exactly `dotSize` pixels on a side and its
 * centroid sits within ±0.5px of the dot for *every* cell of *every* channel.
 *
 * A `floor`/`ceil` window instead grows to an asymmetric `dotSize + 1` span
 * whenever the dot center is fractional. The CMYK screens rotate to different
 * angles, so the rotated ones (Cyan 15°, Magenta 75°, Key 45°) land on
 * fractional lattice points while Yellow (0°) lands on integers — meaning each
 * channel sampled coverage from a differently-sized window drifting off its
 * dot by a channel-specific, cell-varying amount. The four separations then
 * disagreed about where image content sat: a registration artifact. A fixed,
 * round-anchored window samples identically for all four screens, holding them
 * in register.
 */
export function sampleWindow(width: number, height: number, sourceCx: number, sourceCy: number, half: number): SampleWindow {
	const anchorX = Math.round(sourceCx - half)
	const anchorY = Math.round(sourceCy - half)
	const span = Math.round(half * 2)

	return {
		startX: Math.max(0, anchorX),
		startY: Math.max(0, anchorY),
		endX: Math.min(width, anchorX + span),
		endY: Math.min(height, anchorY + span),
	}
}

/**
 * Average a per-pixel scalar over the `dotSize`-wide window centered on a
 * source-space point, clamped to image bounds. `sample(offset)` reads the
 * scalar in [0, 1] at the given byte offset. Returns `null` when the window
 * falls entirely outside the source.
 */
function averageCoverage(
	width: number,
	height: number,
	sourceCx: number,
	sourceCy: number,
	half: number,
	sample: (offset: number) => number,
): number | null {
	const { startX, startY, endX, endY } = sampleWindow(width, height, sourceCx, sourceCy, half)

	let sum = 0
	let count = 0

	for (let pixelY = startY; pixelY < endY; pixelY++) {
		for (let pixelX = startX; pixelX < endX; pixelX++) {
			const offset = (pixelY * width + pixelX) * 4
			sum += sample(offset)
			count++
		}
	}

	if (count === 0) return null

	return sum / count
}

/**
 * Average the source RGB over the `dotSize`-wide window centered on a
 * source-space point, clamped to image bounds. Returns an `[r, g, b]` tuple
 * (each in [0, 255]), or `null` when the window falls entirely outside the
 * source.
 */
function averageColor(
	width: number,
	height: number,
	sourceCx: number,
	sourceCy: number,
	half: number,
	src: Uint8ClampedArray,
): [number, number, number] | null {
	const { startX, startY, endX, endY } = sampleWindow(width, height, sourceCx, sourceCy, half)

	let sumR = 0
	let sumG = 0
	let sumB = 0
	let count = 0

	for (let pixelY = startY; pixelY < endY; pixelY++) {
		for (let pixelX = startX; pixelX < endX; pixelX++) {
			const offset = (pixelY * width + pixelX) * 4
			sumR += src[offset]!
			sumG += src[offset + 1]!
			sumB += src[offset + 2]!
			count++
		}
	}

	if (count === 0) return null

	return [sumR / count, sumG / count, sumB / count]
}

/** Classic process screen angles, in degrees, per CMYK channel. */
const CMYK_ANGLES = { c: 15, m: 75, y: 0, k: 45 } as const

/** Process ink colors as `[r, g, b]` tuples. */
const CMYK_INKS = {
	c: [0, 255, 255],
	m: [255, 0, 255],
	y: [255, 255, 0],
	k: [0, 0, 0],
} as const

/**
 * Convert a halftone screen and its dots into a halftone-rendered `ImageData`.
 *
 * Three color modes:
 *
 * **`"luminance"`** (default) — monochrome screen. Each grid cell's dot radius
 * is proportional to `1 − avgLuminance/255` (dark cells → big dots). Dots are
 * stamped in `dotColor` (default black `[0,0,0]`) on a white background — a
 * classic Ben-Day screen. This is the original, unchanged behavior.
 *
 * **`"cmyk"`** — process halftone. Each source pixel is separated into Cyan /
 * Magenta / Yellow / Key channels via gray-component replacement:
 *   `C = 1 − R/255`, `M = 1 − G/255`, `Y = 1 − B/255`, `K = min(C, M, Y)`,
 *   then `C' = (C − K)/(1 − K)` (and likewise M', Y') when `K < 1`, else 0.
 * Each of the four channels is screened on its own grid, rotated to its
 * classic process angle — Cyan 15°, Magenta 75°, Yellow 0°, Key 45° — with
 * per-cell dot radius proportional to that channel's average coverage. Dots
 * are stamped in their ink color (cyan, magenta, yellow, black) onto a white
 * background and overprinted via `globalCompositeOperation = "multiply"`, so
 * overlapping colored dots subtract toward darker, saturated color the way
 * real process printing builds an image. Output preserves source alpha.
 *
 * **`"color"`** — single-screen color halftone. One shared grid (no channel
 * separation, so nothing can misregister): each cell is stamped as a single
 * dot in that cell's own average color, with radius tracking the cell's
 * darkness (`1 − luminance/255`) so the white paper carries the highlights.
 * The clean comic-dot look. Output preserves source alpha.
 *
 * @param pixels Source image.
 * @param dotSize Grid cell size in pixels. Larger values produce coarser halftone.
 * @param angle Rotation of the (single) dot grid in degrees — `"luminance"` and `"color"` modes only. Default 0.
 * @param colorMode `"luminance"` (default), `"cmyk"`, or `"color"`. Default `"luminance"`.
 * @param dotColor Ink color `[r, g, b]` for the `"luminance"` screen. Default black `[0, 0, 0]`.
 */
export function applyHalftone(
	pixels: ImageData,
	dotSize: number,
	angle = 0,
	colorMode: HalftoneColorMode = "luminance",
	dotColor: [number, number, number] = [0, 0, 0],
): ImageData {
	const { width, height, data: src } = pixels
	const { context } = createCanvas(width, height)

	// White background — both modes overprint onto white paper.
	context.fillStyle = "#ffffff"
	context.fillRect(0, 0, width, height)

	if (colorMode === "cmyk") {
		// Overprint colored dots: multiply so overlapping inks darken toward
		// saturated color, as process printing builds an image.
		context.globalCompositeOperation = "multiply"

		// Screen each channel on its own grid at its process angle. Per cell,
		// coverage is that channel's average ink demand after GCR.
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

					// Gray-component replacement: pull K out of the chromatic channels.
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

		// Preserve source alpha — the multiply screen is fully opaque.
		const out = result.data

		for (let px = 0; px < src.length; px += 4) {
			out[px + 3] = src[px + 3]!
		}

		return new ImageData(out, width, height)
	}

	if (colorMode === "color") {
		// Single shared grid — one dot per cell, stamped in that cell's own
		// average color. No channel separation: there are no overlapping
		// screens that could misregister into moiré. The dot radius tracks the
		// cell's darkness (light cells → small dots, dark cells → large), so
		// the white paper between dots carries the highlights.
		screenChannel(context, width, height, dotSize, angle, (sourceCx, sourceCy, half) => {
			const avg = averageColor(width, height, sourceCx, sourceCy, half, src)

			if (avg === null) return null

			const cov = 1 - luminance(avg[0], avg[1], avg[2]) / 255

			return { cov, color: avg }
		})

		const colorResult = context.getImageData(0, 0, width, height)
		const colorOut = colorResult.data

		// Preserve source alpha — the screen is drawn fully opaque.
		for (let px = 0; px < src.length; px += 4) {
			colorOut[px + 3] = src[px + 3]!
		}

		return new ImageData(colorOut, width, height)
	}

	// Luminance mode — single monochrome screen in dotColor.
	context.fillStyle = `rgb(${dotColor[0]}, ${dotColor[1]}, ${dotColor[2]})`

	screenChannel(context, width, height, dotSize, angle, (sourceCx, sourceCy, half) => {
		const avgLum = averageCoverage(width, height, sourceCx, sourceCy, half, (offset) =>
			luminance(src[offset]!, src[offset + 1]!, src[offset + 2]!),
		)

		if (avgLum === null) return null

		// Dark cells → large dots.
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
 * Converts the image to a halftone pattern.
 *
 * In the default `"luminance"` mode, dot radius varies with local luminance
 * and dots are stamped in `dotColor` on white — a Ben-Day screen.
 *
 * In `"cmyk"` mode it produces a true process halftone: the image is separated
 * into Cyan / Magenta / Yellow / Key channels (via gray-component replacement),
 * each channel is screened on its own grid rotated to its classic process
 * angle (Cyan 15°, Magenta 75°, Yellow 0°, Key 45°), dots are stamped in their
 * ink color and overprinted with multiply compositing — color emerges from the
 * overlapping colored dots, the true process-print look.
 *
 * In `"color"` mode it produces a single-screen color halftone: one shared
 * grid, each cell stamped as one dot in that cell's own average color. With no
 * overlapping screens there is nothing to misregister — the clean comic-dot
 * look, and the mode to reach for in a pop-art treatment.
 *
 * - `dotSize` — Grid cell size in pixels. Larger values produce coarser halftone.
 * - `angle` — Rotation of the dot grid in degrees (`"luminance"`/`"color"` modes only). Default 0.
 * - `colorMode` — `"luminance"` (default), `"cmyk"`, or `"color"`.
 * - `dotColor` — Ink color `[r, g, b]` for the `"luminance"` screen. Default black `[0, 0, 0]`.
 *
 * @param props
 * @category Effects
 */
export function Halftone({ dotSize, angle, colorMode = "luminance", dotColor = [0, 0, 0], map, children }: HalftoneProps) {
	const effect = useCallback<PipelineCallback>(
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
		<Pipeline effect={effect} map={map}>
			{children}
		</Pipeline>
	)
}
