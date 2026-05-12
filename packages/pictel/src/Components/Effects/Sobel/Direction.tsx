import type { ReactNode } from "react"
import { useCallback } from "react"
import { Pipeline, type PipelineCallback } from "../../Pipeline/Pipeline"
import { mixBlend } from "../utils/mix-blend"
import { applyKernels, SCHARR_X, SCHARR_Y, SOBEL_X, SOBEL_Y } from "./kernel"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * Compute the per-pixel gradient direction and magnitude using Sobel or Scharr
 * kernels and emit the result as a packed three-channel field:
 *
 * - R = (cos(theta) + 1) * 127.5    -- horizontal direction component, [-1, 1] -> [0, 255]
 * - G = (sin(theta) + 1) * 127.5    -- vertical direction component,   [-1, 1] -> [0, 255]
 * - B = magnitude / maxResponse * 255 -- gradient strength,            [0, 1]  -> [0, 255]
 * - A = source alpha
 *
 * Pixels with magnitude below `1e-6 * maxResponse` are emitted as
 * `R=128, G=128, B=0` (neutral direction, zero magnitude). The cos/sin
 * components are kept as floats until the final byte conversion to avoid
 * accumulated rounding error.
 */
export function applyDirection(
	pixels: ImageData,
	kernel: "sobel" | "scharr",
): ImageData {
	const { width, height, data: src } = pixels
	const kernelX = kernel === "scharr" ? SCHARR_X : SOBEL_X
	const kernelY = kernel === "scharr" ? SCHARR_Y : SOBEL_Y
	const { gx, gy, maxResponse } = applyKernels(pixels, kernelX, kernelY)

	const output = new Uint8ClampedArray(src.length)
	const epsilon = 1e-6 * maxResponse

	for (let pixelIdx = 0; pixelIdx < width * height; pixelIdx++) {
		const px = pixelIdx * 4
		const dx = gx[pixelIdx]!
		const dy = gy[pixelIdx]!
		const magnitude = Math.sqrt(dx * dx + dy * dy)

		if (magnitude < epsilon) {
			output[px] = 128
			output[px + 1] = 128
			output[px + 2] = 0
		} else {
			const cos = dx / magnitude
			const sin = dy / magnitude
			output[px] = Math.round((cos + 1) * 127.5)
			output[px + 1] = Math.round((sin + 1) * 127.5)
			output[px + 2] = Math.round((magnitude / maxResponse) * 255)
		}

		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, width, height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface DirectionProps {
	/** Convolution kernel pair. `sobel` is the classic 3x3 operator; `scharr` produces a larger, more rotationally symmetric response. Defaults to `sobel`. */
	kernel?: "sobel" | "scharr"
	map?: ReactNode
	children: ReactNode
}

/**
 * Outputs the gradient field of the input as a packed three-channel encoding
 * suitable for sampling-correct downstream consumption (e.g. `LIC`, mapped
 * effects).
 *
 * - `kernel` — `sobel` (default) or `scharr`.
 *
 * @remarks
 * The output channels are packed as:
 * - R = cos(theta) packed [-1, 1] -> [0, 255]  (horizontal direction component)
 * - G = sin(theta) packed [-1, 1] -> [0, 255]  (vertical direction component)
 * - B = magnitude unsigned [0, 1] -> [0, 255]  (normalized against the kernel's max response)
 *
 * This split-component encoding (rather than a single packed angle) avoids the
 * 1 deg / 359 deg wraparound problem so that bilinear sampling of cos and sin
 * separately, followed by `atan2(sin', cos')`, yields a correct interpolated
 * direction at fractional positions.
 *
 * The packed output does NOT visualize as a recognizable image in DevTools —
 * it appears as red/green static. This is by design (correctness over visual
 * readability). To visually inspect direction, decode in a custom effect.
 *
 * @param props
 * @category Effects
 */
export function Direction({ kernel = "sobel", map, children }: DirectionProps) {
	const effect = useCallback<PipelineCallback>(
		(target, _apply, mapPixels) => {
			const result = applyDirection(target, kernel)

			if (mapPixels !== undefined) {
				return mixBlend(target, result, mapPixels)
			}

			return result
		},
		[kernel],
	)

	return (
		<Pipeline effect={effect} map={map}>
			{children}
		</Pipeline>
	)
}
