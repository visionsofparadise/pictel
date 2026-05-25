import type { ReactNode } from "react"
import { useCallback } from "react"
import { Pipeline, type PipelineCallback } from "../../Pipeline/Pipeline"
import { boxBlurChannel } from "../utils/box-blur-channel"
import { mixBlend } from "../utils/mix-blend"
import { applyKernels, SCHARR_X, SCHARR_Y, SOBEL_X, SOBEL_Y } from "./kernel"

const INTEGRATION_RADIUS = 4

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

/**
 * Compute a smooth, contour-following orientation field via the structure
 * tensor and emit it in the same packed three-channel encoding as
 * `applyDirection`.
 *
 * Raw per-pixel gradient direction (`applyDirection`) is noisy: along an edge
 * the gradient flips 180 degrees pixel-to-pixel, and averaging those opposite
 * vectors cancels them out. The structure tensor avoids this by averaging the
 * *outer product* of the gradient (`gx*gx`, `gx*gy`, `gy*gy`) instead of the
 * gradient itself — orientation, which is direction modulo 180 degrees, does
 * not suffer the opposite-vector cancellation. The result is a field that
 * field-aligned consumers (`LIC`, `Hatch`) can follow coherently around forms.
 *
 * Algorithm:
 * 1. Per-pixel gradients `gx, gy` via `applyKernels` (Sobel or Scharr).
 * 2. Tensor components per pixel: `e = gx*gx`, `f = gx*gy`, `g = gy*gy`.
 * 3. Smooth `e, f, g` with a separable box blur at `INTEGRATION_RADIUS`.
 * 4. Eigenvalues `lambda1,2 = (e+g)/2 +/- sqrt(((e-g)/2)^2 + f^2)`.
 * 5. Dominant-gradient orientation `phi = 0.5 * atan2(2f, e - g)`; the flow
 *    direction *along* contours is `phi + PI/2`.
 * 6. Coherence (anisotropy) `coh = (lambda1 - lambda2) / (lambda1 + lambda2)`,
 *    range `[0, 1]`.
 * 7. Encode `R = (cos+1)*127.5`, `G = (sin+1)*127.5`, `B = coh*255`, `A` from
 *    the source. Degenerate pixels (`lambda1+lambda2 <= epsilon`) emit
 *    `R=128, G=128, B=0`, matching `applyDirection`'s neutral encoding.
 *
 * The B channel carries coherence here (it carries gradient magnitude in
 * `applyDirection`). A consumer that magnitude-gates on B should ignore it for
 * a structure field — set `uniformStep` on `LIC`/`Hatch`.
 */
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

	const eSmooth = boxBlurChannel(tensorE, width, height, INTEGRATION_RADIUS)
	const fSmooth = boxBlurChannel(tensorF, width, height, INTEGRATION_RADIUS)
	const gSmooth = boxBlurChannel(tensorG, width, height, INTEGRATION_RADIUS)

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
	/** Convolution kernel pair. `sobel` is the classic 3x3 operator; `scharr` produces a larger, more rotationally symmetric response. Defaults to `sobel`. */
	kernel?: "sobel" | "scharr"
	/**
	 * Selects the *field type*, not the `"parameter"|"mix"` modulation axis that
	 * `mode` denotes on other effects (the two are unrelated — `Direction` has no
	 * parameter/mix variant). `gradient` (default) emits the per-pixel Sobel
	 * gradient direction. `structure` emits a smoothed, contour-following
	 * orientation field computed from the structure tensor — the field
	 * field-aligned `Hatch`/`LIC` can follow coherently.
	 */
	mode?: "gradient" | "structure"
	map?: ReactNode
	children: ReactNode
}

/**
 * Outputs the gradient field of the input as a packed three-channel encoding
 * suitable for sampling-correct downstream consumption (e.g. `LIC`, mapped
 * effects).
 *
 * - `kernel` — `sobel` (default) or `scharr`.
 * - `mode` — `gradient` (default) emits the noisy per-pixel gradient direction;
 *   `structure` emits a smooth contour-following orientation field from the
 *   structure tensor. This `mode` selects the field type and is unrelated to
 *   the `"parameter"|"mix"` `mode` on other effects.
 *
 * @remarks
 * The output channels are packed as:
 * - R = cos(theta) packed [-1, 1] -> [0, 255]  (horizontal direction component)
 * - G = sin(theta) packed [-1, 1] -> [0, 255]  (vertical direction component)
 * - B = field strength unsigned [0, 1] -> [0, 255]  (gradient magnitude in
 *   `gradient` mode; structure-tensor coherence in `structure` mode)
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
export function Direction({
	kernel = "sobel",
	mode = "gradient",
	map,
	children,
}: DirectionProps) {
	const effect = useCallback<PipelineCallback>(
		(target, _apply, mapPixels) => {
			const result =
				mode === "structure"
					? applyStructureField(target, kernel)
					: applyDirection(target, kernel)

			if (mapPixels !== undefined) {
				return mixBlend(target, result, mapPixels)
			}

			return result
		},
		[kernel, mode],
	)

	return (
		<Pipeline effect={effect} map={map}>
			{children}
		</Pipeline>
	)
}
