import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { boxBlurChannels } from "./utils/box-blur-channel"
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

	let nextChannels: Array<Float32Array> = [
		new Float32Array(count),
		new Float32Array(count),
		new Float32Array(count),
	]

	// Pre-allocated outputs for the per-pass smoothing blur. Phase 14.2's
	// `boxBlurChannels` writes into these on every iteration so the iteration
	// loop allocates only the helper's shared horizontal scratch (1 Float32Array)
	// instead of 2N (= 6) per pass.
	const smoothed: Array<Float32Array> = [
		new Float32Array(count),
		new Float32Array(count),
		new Float32Array(count),
	]

	for (let pass = 0; pass < passes; pass++) {
		boxBlurChannels(channels, width, height, SMOOTH_RADIUS, smoothed)

		const lum = new Float32Array(count)

		for (let pixelIdx = 0; pixelIdx < count; pixelIdx++) {
			lum[pixelIdx] = luminance(
				smoothed[0]![pixelIdx]!,
				smoothed[1]![pixelIdx]!,
				smoothed[2]![pixelIdx]!,
			)
		}

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

		const prevChannels: Array<Float32Array> = [
			channels[0]!,
			channels[1]!,
			channels[2]!,
		]
		channels[0] = nextChannels[0]!
		channels[1] = nextChannels[1]!
		channels[2] = nextChannels[2]!
		nextChannels = prevChannels
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
	iterations?: number
	strength?: number
	mode?: "parameter" | "mix"
	map?: ReactNode
	children: ReactNode
}

/**
 * Iterative edge-aware sharpening — flattens regions and crispens edges into a
 * clean cartoon / line-drawing look without the ringing of a single-pass
 * `<Sharpen>`. More iterations push regions further toward flat colour and
 * harden the edges further; cost scales with `iterations`.
 *
 * - `iterations` — Number of passes. Default 8.
 * - `strength` — Per-iteration step size, clamped to ≤ 1. Default 1.
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
