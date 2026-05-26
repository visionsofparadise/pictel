import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { boxBlurChannel } from "./utils/box-blur-channel"
import { luminance } from "./utils/luminance"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

const SMOOTH_RADIUS = 1

export function applyShockFilter(
	pixels: ImageData,
	iterations: number,
	strength: number,
): ImageData {
	const { width, height, data: src } = pixels
	const output = new Uint8ClampedArray(src.length)
	const count = width * height

	for (let pixelIdx = 0; pixelIdx < count; pixelIdx++) {
		output[pixelIdx * 4 + 3] = src[pixelIdx * 4 + 3]!
	}

	const channels: Array<Float32Array> = []

	for (let channel = 0; channel < 3; channel++) {
		const buffer = new Float32Array(count)

		for (let pixelIdx = 0; pixelIdx < count; pixelIdx++) {
			buffer[pixelIdx] = src[pixelIdx * 4 + channel]!
		}

		channels.push(buffer)
	}

	const passes = Math.max(0, Math.floor(iterations))
	const dt = Math.min(1, strength)

	for (let pass = 0; pass < passes; pass++) {
		const smoothed = channels.map((channel) =>
			boxBlurChannel(channel, width, height, SMOOTH_RADIUS),
		)

		const lum = new Float32Array(count)

		for (let pixelIdx = 0; pixelIdx < count; pixelIdx++) {
			lum[pixelIdx] = luminance(
				smoothed[0]![pixelIdx]!,
				smoothed[1]![pixelIdx]!,
				smoothed[2]![pixelIdx]!,
			)
		}

		const nextChannels = [
			new Float32Array(count),
			new Float32Array(count),
			new Float32Array(count),
		]

		for (let y = 0; y < height; y++) {
			const yUp = y > 0 ? y - 1 : 0
			const yDown = y < height - 1 ? y + 1 : height - 1

			for (let x = 0; x < width; x++) {
				const xLeft = x > 0 ? x - 1 : 0
				const xRight = x < width - 1 ? x + 1 : width - 1

				const centerIdx = y * width + x

				const laplacian =
					lum[y * width + xRight]! +
					lum[y * width + xLeft]! +
					lum[yDown * width + x]! +
					lum[yUp * width + x]! -
					4 * lum[centerIdx]!

				const sign = laplacian > 0 ? 1 : laplacian < 0 ? -1 : 0

				for (let channel = 0; channel < 3; channel++) {
					const current = channels[channel]!
					const center = current[centerIdx]!

					const gradX =
						(current[y * width + xRight]! - current[y * width + xLeft]!) / 2
					const gradY =
						(current[yDown * width + x]! - current[yUp * width + x]!) / 2
					const gradMag = Math.sqrt(gradX * gradX + gradY * gradY)

					const shocked = center - sign * gradMag * dt

					nextChannels[channel]![centerIdx] =
						shocked < 0 ? 0 : shocked > 255 ? 255 : shocked
				}
			}
		}

		channels[0] = nextChannels[0]!
		channels[1] = nextChannels[1]!
		channels[2] = nextChannels[2]!
	}

	for (let channel = 0; channel < 3; channel++) {
		const buffer = channels[channel]!

		for (let pixelIdx = 0; pixelIdx < count; pixelIdx++) {
			output[pixelIdx * 4 + channel] = Math.round(buffer[pixelIdx]!)
		}
	}

	return new ImageData(output, width, height)
}

export function applyMappedShockFilter(
	pixels: ImageData,
	map: ImageData,
	iterations: number,
	strength: number,
): ImageData {
	return mixBlend(pixels, applyShockFilter(pixels, iterations, strength), map)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface ShockFilterProps {
	/** Number of blur-then-sharpen passes. More iterations flatten regions further and crispen edges harder. Cost is linear in this value. Default 8. */
	iterations?: number
	/** Shock step size `dt` per iteration, clamped to `<= 1` for stability. Default 1. */
	strength?: number
	/** `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance. */
	mode?: "parameter" | "mix"
	map?: ReactNode
	children: ReactNode
}

/**
 * Regularized iterative shock filter — sharpens an image into a clean
 * cartoon / line-drawing.
 *
 * Each iteration presmooths the image, then takes one Osher–Rudin shock step
 * (dilate toward the bright side of each edge, erode toward the dark side).
 * Iterating converges to piecewise-flat regions separated by crisp edges, with
 * no ringing — unlike a single-pass `Sharpen`. Cost is `O(W*H*iterations)`.
 *
 * - `iterations` — Number of blur-then-sharpen passes. Default 8.
 * - `strength` — Shock step size per iteration (clamped to ≤ 1). Default 1.
 * - `mode` — `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance.
 *
 * @param props
 * @category Effects
 */
export function ShockFilter({
	iterations = 8,
	strength = 1,
	mode = "parameter",
	map,
	children,
}: ShockFilterProps) {
	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				if (mode === "parameter") {
					return applyMappedShockFilter(target, mapPixels, iterations, strength)
				}

				const result = applyShockFilter(target, iterations, strength)

				return mixBlend(target, result, mapPixels)
			}

			return applyShockFilter(target, iterations, strength)
		},
		[iterations, strength, mode],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
