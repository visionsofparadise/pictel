import type { ReactNode } from "react"
import { useCallback } from "react"
import { Pipeline, type PipelineCallback } from "../Pipeline/Pipeline"
import { boxBlurChannel } from "./utils/box-blur-channel"
import { luminance } from "./utils/luminance"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

const SMOOTH_RADIUS = 1

/**
 * Regularized iterative shock filter — the mathematically well-behaved limit of
 * "sharpen the image over and over."
 *
 * A raw shock filter (Osher–Rudin) repeatedly dilates pixels toward the bright
 * side of an edge and erodes them toward the dark side, steepening every edge
 * into a true discontinuity. Applied naively it amplifies noise into spurious
 * shocks. This implementation regularizes it: each iteration presmooths the
 * channels with a small box blur (`SMOOTH_RADIUS`) before estimating the
 * Laplacian sign, so the dilate/erode decision follows real structure rather
 * than noise. Each iteration is one blur-then-sharpen step.
 *
 * The shock *direction* is coupled across the three colour channels through
 * luminance. Deciding `sign(Laplacian)` per channel lets the channels disagree
 * about which side of an edge to pull from on a detailed photo, producing
 * per-channel colour fringing — a fine, colourful maze instead of bold coherent
 * flat regions. Computing one shared `sign(L)` map from the luminance of the
 * smoothed channels keeps the dilate/erode decision identical for R, G and B,
 * so every channel shocks the same way at every edge. Each channel still keeps
 * its own gradient magnitude, so it retains its own contrast.
 *
 * Per iteration (alpha passed through):
 *  1. Presmooth each of the R, G, B channel buffers → `sR, sG, sB`.
 *  2. Compute a single luminance buffer `Lum` (BT.601) from `sR, sG, sB`.
 *  3. Compute the 5-point Laplacian of `Lum`, edge-clamped → one shared
 *     `sign(L)` map for the iteration.
 *  4. Per channel, compute the gradient magnitude of that channel's *current*
 *     (un-presmoothed) buffer via central differences, edge-clamped.
 *  5. Shock step per channel: `I_new = I - sign(L) * gradMag * dt`,
 *     `dt = min(1, strength)`.
 *  6. Clamp to `[0, 255]`.
 *
 * Iterating converges to piecewise-flat regions separated by crisp edges — a
 * clean cartoon / line-drawing look with no ringing or colour fringing.
 * `iterations <= 0` returns an unchanged copy. Grayscale inputs (R = G = B) are
 * unaffected by the luminance coupling, since luminance then equals every
 * channel.
 *
 * Cost is `O(W*H*iterations)`. Acceptable for static demos; keep `iterations`
 * modest (~8–14) on larger images.
 */
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

/**
 * Map-driven shock filter. The shock-filtered result is computed from the
 * source pixels and mixed back with the original by map luminance: black map →
 * original, white map → fully shock-filtered.
 */
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
	const effect = useCallback<PipelineCallback>(
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
		<Pipeline effect={effect} map={map}>
			{children}
		</Pipeline>
	)
}
