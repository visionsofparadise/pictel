import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { mixBlend } from "../utils/mix-blend"
import { applyKernels, SCHARR_X, SCHARR_Y, SOBEL_X, SOBEL_Y } from "./kernel"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applyEdgeDetect(
	pixels: ImageData,
	kernel: "sobel" | "scharr",
): ImageData {
	const { width, height, data: src } = pixels
	const kernelX = kernel === "scharr" ? SCHARR_X : SOBEL_X
	const kernelY = kernel === "scharr" ? SCHARR_Y : SOBEL_Y
	const { gx, gy, maxResponse } = applyKernels(pixels, kernelX, kernelY)

	const output = new Uint8ClampedArray(src.length)

	for (let pixelIdx = 0; pixelIdx < width * height; pixelIdx++) {
		const px = pixelIdx * 4
		const magnitude = Math.sqrt(
			gx[pixelIdx]! * gx[pixelIdx]! + gy[pixelIdx]! * gy[pixelIdx]!,
		)
		const byte = Math.min(255, Math.max(0, Math.round((magnitude / maxResponse) * 255)))
		output[px] = byte
		output[px + 1] = byte
		output[px + 2] = byte
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, width, height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface EdgeDetectProps {
	/** Convolution kernel pair. `sobel` is the classic 3x3 operator; `scharr` produces a larger, more rotationally symmetric response. Defaults to `sobel`. */
	kernel?: "sobel" | "scharr"
	map?: ReactNode
	children: ReactNode
}

/**
 * Outputs the gradient magnitude of the input as a continuous grayscale field.
 *
 * Useful as a building block for masking, displacement, and stylized looks.
 * Pre-blur the input (chain `<Blur>`) for cleaner, less noise-driven edges.
 *
 * - `kernel` — `sobel` (default) or `scharr`. Scharr has a larger response and
 *   is more rotationally symmetric.
 *
 * @param props
 * @category Effects
 */
export function EdgeDetect({ kernel = "sobel", map, children }: EdgeDetectProps) {
	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			const result = applyEdgeDetect(target, kernel)

			if (mapPixels !== undefined) {
				return mixBlend(target, result, mapPixels)
			}

			return result
		},
		[kernel],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
