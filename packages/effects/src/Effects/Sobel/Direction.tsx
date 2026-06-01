import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { boxBlurChannels } from "../utils/box-blur-channel"
import { mixBlend } from "../utils/mix-blend"
import {
	applyColorKernels,
	applyKernels,
	SCHARR_X,
	SCHARR_Y,
	SOBEL_X,
	SOBEL_Y,
} from "./kernel"

const INTEGRATION_RADIUS = 4

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applyDirection(
	pixels: ImageData,
	kernel: "sobel" | "scharr",
	space: "luminance" | "color" = "luminance",
): ImageData {
	const { width, height, data: src } = pixels
	const kernelX = kernel === "scharr" ? SCHARR_X : SOBEL_X
	const kernelY = kernel === "scharr" ? SCHARR_Y : SOBEL_Y
	const { gx, gy, magnitude, maxResponse } =
		space === "color"
			? applyColorKernels(pixels, kernelX, kernelY)
			: applyKernels(pixels, kernelX, kernelY)

	const output = new Uint8ClampedArray(src.length)
	const epsilon = 1e-6 * maxResponse

	for (let pixelIdx = 0; pixelIdx < width * height; pixelIdx++) {
		const px = pixelIdx * 4
		const dx = gx[pixelIdx]!
		const dy = gy[pixelIdx]!
		const mag = magnitude[pixelIdx]!

		if (mag < epsilon) {
			output[px] = 128
			output[px + 1] = 128
			output[px + 2] = 0
		} else {
			const cos = dx / mag
			const sin = dy / mag
			output[px] = Math.round((cos + 1) * 127.5)
			output[px + 1] = Math.round((sin + 1) * 127.5)
			output[px + 2] = Math.round((mag / maxResponse) * 255)
		}

		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, width, height)
}

export function applyStructureField(
	pixels: ImageData,
	kernel: "sobel" | "scharr",
): ImageData {
	const { width, height, data: src } = pixels
	const kernelX = kernel === "scharr" ? SCHARR_X : SOBEL_X
	const kernelY = kernel === "scharr" ? SCHARR_Y : SOBEL_Y
	const { gx, gy } = applyKernels(pixels, kernelX, kernelY)

	const count = width * height
	const tensorE = new Float32Array(count)
	const tensorF = new Float32Array(count)
	const tensorG = new Float32Array(count)

	for (let pixelIdx = 0; pixelIdx < count; pixelIdx++) {
		const dx = gx[pixelIdx]!
		const dy = gy[pixelIdx]!
		tensorE[pixelIdx] = dx * dx
		tensorF[pixelIdx] = dx * dy
		tensorG[pixelIdx] = dy * dy
	}

	// Pre-allocated per Phase 14.3: single boxBlurChannels call with caller-
	// supplied output buffers shares one horizontal scratch across the three
	// tensor channels (4 allocations total vs. 6 with three separate calls).
	const eSmooth = new Float32Array(count)
	const fSmooth = new Float32Array(count)
	const gSmooth = new Float32Array(count)

	boxBlurChannels(
		[tensorE, tensorF, tensorG],
		width,
		height,
		INTEGRATION_RADIUS,
		[eSmooth, fSmooth, gSmooth],
	)

	const output = new Uint8ClampedArray(src.length)
	const epsilon = 1e-6

	for (let pixelIdx = 0; pixelIdx < count; pixelIdx++) {
		const px = pixelIdx * 4
		const ev = eSmooth[pixelIdx]!
		const fv = fSmooth[pixelIdx]!
		const gv = gSmooth[pixelIdx]!

		const trace = ev + gv

		if (trace <= epsilon) {
			output[px] = 128
			output[px + 1] = 128
			output[px + 2] = 0
		} else {
			const half = (ev - gv) / 2
			const discriminant = Math.sqrt(half * half + fv * fv)
			const lambda1 = trace / 2 + discriminant
			const lambda2 = trace / 2 - discriminant

			const phi = 0.5 * Math.atan2(2 * fv, ev - gv)
			const flow = phi + Math.PI / 2
			const cos = Math.cos(flow)
			const sin = Math.sin(flow)

			const sum = lambda1 + lambda2
			const coherence = sum > epsilon ? (lambda1 - lambda2) / sum : 0

			output[px] = Math.round((cos + 1) * 127.5)
			output[px + 1] = Math.round((sin + 1) * 127.5)
			output[px + 2] = Math.round(coherence * 255)
		}

		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, width, height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface DirectionProps {
	kernel?: "sobel" | "scharr"
	mode?: "gradient" | "structure"
	space?: "luminance" | "color"
	map?: ReactNode
	children: ReactNode
	version?: string
}

/**
 * Produces a direction field describing how the image flows at every pixel.
 * Feed this through the `map` prop on `LIC` or the field-aligned mode of
 * `Hatch` to drive streamline-following effects.
 *
 * Output is not meant to be visually readable — it renders as red/green static
 * in DevTools. That's correct; the encoding favors sampling accuracy over
 * legibility.
 *
 * - `kernel` — `"sobel"` (default) or `"scharr"`. Scharr produces a larger,
 *   more rotationally symmetric response.
 * - `mode` — `"gradient"` (default) emits the per-pixel gradient direction;
 *   `"structure"` emits a smooth, contour-following orientation field — the
 *   one to reach for when feeding `LIC` or `Hatch` over an organic field.
 *   Unrelated to the `"parameter"|"mix"` `mode` on other effects.
 * - `space` — `"luminance"` (default) runs Sobel on BT.601 luminance;
 *   `"color"` runs per-channel Sobel and outputs the channel-averaged
 *   gradient direction with colour-distance magnitude. `space="color"` is
 *   honoured only for `mode="gradient"` — `mode="structure"` always uses
 *   luminance regardless of `space`.
 * - `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.
 *
 * @param props
 * @category Effects
 */
export function Direction({
	kernel = "sobel",
	mode = "gradient",
	space = "luminance",
	map,
	children,
	version,
}: DirectionProps) {
	const internal = `direction@1+k=${kernel}+m=${mode}+s=${space}`
	const composedVersion = version === undefined ? internal : `${internal}+${version}`

	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			const result =
				mode === "structure"
					? applyStructureField(target, kernel)
					: applyDirection(target, kernel, space)

			if (mapPixels !== undefined) {
				return mixBlend(target, result, mapPixels)
			}

			return result
		},
		[kernel, mode, space],
	)

	return (
		<RasterEffect effect={effect} map={map} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
