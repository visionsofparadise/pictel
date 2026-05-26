import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { luminance } from "./utils/luminance"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

const AA = 0.07
const HATCH_LO = 0.55
const HATCH_HI = 0.95

function clamp01(value: number): number {
	return value < 0 ? 0 : value > 1 ? 1 : value
}

function stripeCoverage(radius: number, dist: number): number {
	return clamp01((radius - dist) / AA)
}

export function applyEngrave(
	pixels: ImageData,
	spacing: number,
	angle: number,
	relief: number,
	crossHatch: boolean,
): ImageData {
	const { width, height, data: src } = pixels
	const output = new Uint8ClampedArray(src.length)
	const period = Math.max(1, spacing)
	const cosA = Math.cos(angle)
	const sinA = Math.sin(angle)

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const offset = (y * width + x) * 4
			const lum = luminance(src[offset]!, src[offset + 1]!, src[offset + 2]!) / 255
			const darkness = 1 - lum
			const warp = relief * (lum - 0.5)

			const posH = y * cosA - x * sinA + warp
			const fracH = posH / period - Math.floor(posH / period)
			const distH = Math.min(fracH, 1 - fracH) * 2
			const coverH = stripeCoverage(darkness, distH)

			let coverV = 0

			if (crossHatch) {
				const hatch = clamp01((darkness - HATCH_LO) / (HATCH_HI - HATCH_LO))
				const posV = x * cosA + y * sinA + warp
				const fracV = posV / period - Math.floor(posV / period)
				const distV = Math.min(fracV, 1 - fracV) * 2
				coverV = stripeCoverage(hatch, distV)
			}

			const value = Math.round(255 * (1 - Math.max(coverH, coverV)))

			output[offset] = value
			output[offset + 1] = value
			output[offset + 2] = value
			output[offset + 3] = src[offset + 3]!
		}
	}

	return new ImageData(output, width, height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface EngraveProps {
	spacing?: number
	angle?: number
	relief?: number
	crossHatch?: boolean
	children: ReactNode
}

/**
 * Line-engraving (intaglio) effect. Renders the source as warped parallel
 * lines whose thickness is modulated by tone, with optional cross-hatched
 * shadows — the look of an engraved banknote or steel-plate portrait.
 *
 * Output is grayscale (black ink on white); wrap in `Duotone` for colored ink.
 * For clean, blank highlights, brighten the source first (e.g. `Brightness`)
 * so the lightest region reaches white — the lines vanish wherever tone is
 * white.
 *
 * - `spacing` — Pixels between adjacent line centres. Default 6.
 * - `angle` — Line orientation in radians. Default 0 (horizontal).
 * - `relief` — Pixels the lines bow with tone. Default 0 (straight).
 * - `crossHatch` — Cross-hatch the darkest tones. Default true.
 *
 * @param props
 * @category Effects
 */
export function Engrave({
	spacing = 6,
	angle = 0,
	relief = 0,
	crossHatch = true,
	children,
}: EngraveProps) {
	const effect = useCallback<RasterEffectCallback>(
		(target) => applyEngrave(target, spacing, angle, relief, crossHatch),
		[spacing, angle, relief, crossHatch],
	)

	return <RasterEffect effect={effect}>{children}</RasterEffect>
}
