import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { mixBlend } from "../utils/mix-blend"
import {
	applyColorKernels,
	applyKernels,
	SCHARR_X,
	SCHARR_Y,
	SOBEL_X,
	SOBEL_Y,
} from "./kernel"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applyEdgeDetect(
	pixels: ImageData,
	kernel: "sobel" | "scharr",
	space: "luminance" | "color" = "luminance",
): ImageData {
	const { width, height, data: src } = pixels
	const kernelX = kernel === "scharr" ? SCHARR_X : SOBEL_X
	const kernelY = kernel === "scharr" ? SCHARR_Y : SOBEL_Y
	const { magnitude, maxResponse } =
		space === "color"
			? applyColorKernels(pixels, kernelX, kernelY)
			: applyKernels(pixels, kernelX, kernelY)

	const output = new Uint8ClampedArray(src.length)

	for (let pixelIdx = 0; pixelIdx < width * height; pixelIdx++) {
		const px = pixelIdx * 4
		const byte = Math.min(255, Math.max(0, Math.round((magnitude[pixelIdx]! / maxResponse) * 255)))
		output[px] = byte
		output[px + 1] = byte
		output[px + 2] = byte
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, width, height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface EdgeDetectProps {
	kernel?: "sobel" | "scharr"
	space?: "luminance" | "color"
	map?: ReactNode
	children: ReactNode
	version?: string
}

/**
 * Outputs the gradient magnitude of the input as a continuous grayscale field.
 *
 * Useful as a building block for masking, displacement, and stylized looks.
 * Pre-blur the input (chain `<Blur>`) for cleaner, less noise-driven edges.
 *
 * - `kernel` — `sobel` (default) or `scharr`. Scharr has a larger response and
 *   is more rotationally symmetric.
 * - `space` — `"luminance"` (default) runs Sobel on BT.601 luminance; equal-
 *   luminance hue boundaries produce zero magnitude. `"color"` runs Sobel on
 *   R, G, B independently and combines per-pixel as `√(Σ_channel(gxC²+gyC²))`
 *   — the true colour-distance gradient. Use `"color"` when boundary detection
 *   must respect hue changes (e.g. asymmetric watercolour rim effects).
 * - `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.
 *
 * @param props
 * @category Effects
 */
export function EdgeDetect({
	kernel = "sobel",
	space = "luminance",
	map,
	children,
	version,
}: EdgeDetectProps) {
	const internal = `edgeDetect@1+k=${kernel}+s=${space}`
	const composedVersion = version === undefined ? internal : `${internal}+${version}`

	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			const result = applyEdgeDetect(target, kernel, space)

			if (mapPixels !== undefined) {
				return mixBlend(target, result, mapPixels)
			}

			return result
		},
		[kernel, space],
	)

	return (
		<RasterEffect effect={effect} map={map} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
