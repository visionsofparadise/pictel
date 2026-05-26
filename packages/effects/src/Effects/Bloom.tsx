import type { ReactNode } from "react"
import { useCallback } from "react"
import { normalizeResult, RasterEffect, type RasterEffectCallback } from "pictel"
import { applyUniformBlur } from "./Blur"
import { luminance } from "./utils/luminance"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applyBloom(
	pixels: ImageData,
	threshold: number,
	radius: number,
	intensity: number,
): ImageData {
	const width = pixels.width
	const height = pixels.height
	const src = pixels.data

	const range = 1 - threshold
	const highlightData = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const red = src[px]!
		const green = src[px + 1]!
		const blue = src[px + 2]!

		const lum = luminance(red, green, blue) / 255
		const knee = range > 0 ? Math.max(0, Math.min(1, (lum - threshold) / range)) : lum >= threshold ? 1 : 0
		const weight = knee * knee

		highlightData[px] = red * weight
		highlightData[px + 1] = green * weight
		highlightData[px + 2] = blue * weight
		highlightData[px + 3] = 255
	}

	const highlights = new ImageData(highlightData, width, height)

	const blurred = normalizeResult(applyUniformBlur(highlights, radius))
	const blurData = blurred.pixels.data
	const blurW = blurred.pixels.width
	const ox = blurred.overflow.left
	const oy = blurred.overflow.top

	const output = new Uint8ClampedArray(src.length)

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const srcIdx = (y * width + x) * 4
			const blurIdx = ((y + oy) * blurW + (x + ox)) * 4

			for (let ch = 0; ch < 3; ch++) {
				const base = src[srcIdx + ch]!
				const bloom = Math.min(255, blurData[blurIdx + ch]! * intensity)
				output[srcIdx + ch] = 255 - ((255 - base) * (255 - bloom)) / 255
			}

			output[srcIdx + 3] = src[srcIdx + 3]!
		}
	}

	return new ImageData(output, width, height)
}

export function applyMappedBloom(
	pixels: ImageData,
	map: ImageData,
	threshold: number,
	radius: number,
	intensity: number,
): ImageData {
	const bloomed = applyBloom(pixels, threshold, radius, intensity)

	return mixBlend(pixels, bloomed, map)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface BloomProps {
	/** Luminance threshold (0–1) above which pixels contribute to the glow. A quadratic soft knee fades highlights in smoothly. Default 0.75. */
	threshold?: number
	/** Blur radius of the glow in pixels. Larger values spread the glow further. Default 16. */
	radius?: number
	/** Glow strength multiplier applied before screen-blending. Default 1. */
	intensity?: number
	/** `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance. */
	mode?: "parameter" | "mix"
	map?: ReactNode
	children: ReactNode
}

/**
 * Adds a soft glow that bleeds out of the bright regions of the image. The
 * glow is clipped to the frame — output dimensions match the input.
 *
 * - `threshold` — Luminance cutoff in `[0, 1]` for what counts as a highlight. Highlights fade in smoothly through a soft knee. Default 0.75.
 * - `radius` — Glow blur radius in pixels. Larger values spread the glow further. Default 16.
 * - `intensity` — Glow strength multiplier. Default 1.
 * - `mode` — `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance.
 *
 * @param props
 * @category Effects
 */
export function Bloom({
	threshold = 0.75,
	radius = 16,
	intensity = 1,
	mode = "parameter",
	map,
	children,
}: BloomProps) {
	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				if (mode === "parameter") {
					return applyMappedBloom(target, mapPixels, threshold, radius, intensity)
				}

				const result = applyBloom(target, threshold, radius, intensity)

				return mixBlend(target, result, mapPixels)
			}

			return applyBloom(target, threshold, radius, intensity)
		},
		[threshold, radius, intensity, mode],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
