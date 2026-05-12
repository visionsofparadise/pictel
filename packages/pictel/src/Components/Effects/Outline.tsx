import type { ReactNode } from "react"
import { useCallback } from "react"
import { normalizeResult } from "../utils/raster"
import { Pipeline, type PipelineCallback } from "../Pipeline/Pipeline"
import { applyUniformBlur } from "./Blur"
import { luminance } from "./utils/luminance"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

const TAU = 0.98

/**
 * XDoG (Extended Difference of Gaussians) line-art outline.
 *
 * Algorithm (Winnemöller et al. 2012, stylized formulation):
 * `S = (1 + τ)·G_σ − τ·G_kσ` — the inner Gaussian with the high-frequency
 * component amplified by τ. Equivalent to `G_σ + τ·(G_σ − G_kσ)`. Uniform
 * regions reproduce as G_σ ≈ I, so they sit at their original luminance and
 * stay above ε after normalization to [0, 1]. Only edges, where G_σ < G_kσ on
 * the dark side, drop below ε and get sigmoid-darkened — producing a stroke
 * on the dark side of each edge against an otherwise white field. Output is
 * continuous tonal; chain `Threshold` for hard binary lines.
 */
export function applyOutline(
	pixels: ImageData,
	sigma: number,
	kappa: number,
	epsilon: number,
	phi: number,
): ImageData {
	const width = pixels.width
	const height = pixels.height
	const src = pixels.data

	// Build a single-channel grayscale ImageData (R=G=B=luminance, A=255).
	const lumData = new Uint8ClampedArray(width * height * 4)

	for (let px = 0; px < src.length; px += 4) {
		const lum = luminance(src[px]!, src[px + 1]!, src[px + 2]!)
		const rounded = Math.round(lum)
		lumData[px] = rounded
		lumData[px + 1] = rounded
		lumData[px + 2] = rounded
		lumData[px + 3] = 255
	}

	const lumImage = new ImageData(lumData, width, height)

	// Two Gaussian blurs at σ and k·σ.
	const blur1 = normalizeResult(applyUniformBlur(lumImage, sigma))
	const blur2 = normalizeResult(applyUniformBlur(lumImage, sigma * kappa))

	const buf1 = blur1.pixels.data
	const w1 = blur1.pixels.width
	const ox1 = blur1.overflow.left
	const oy1 = blur1.overflow.top

	const buf2 = blur2.pixels.data
	const w2 = blur2.pixels.width
	const ox2 = blur2.overflow.left
	const oy2 = blur2.overflow.top

	// XDoG soft-threshold per pixel, written back into a same-size output that
	// preserves the source alpha channel. The blur overflow is consumed here —
	// XDoG output is the same dimensions as the input.
	const output = new Uint8ClampedArray(src.length)

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const srcIdx = (y * width + x) * 4
			const idx1 = ((y + oy1) * w1 + (x + ox1)) * 4
			const idx2 = ((y + oy2) * w2 + (x + ox2)) * 4

			const g1 = buf1[idx1]!
			const g2 = buf2[idx2]!

			// Canonical XDoG operator (stylized formulation): S = (1+τ)·G_σ − τ·G_kσ.
			// Uniform regions reproduce input luminance; edges deviate via the
			// amplified G_σ − G_kσ term. Normalize to [0, 1] for the sigmoid.
			const xdog = ((1 + TAU) * g1 - TAU * g2) / 255

			let value: number

			if (xdog >= epsilon) {
				value = 255
			} else {
				value = 255 * (1 + Math.tanh(phi * (xdog - epsilon)))
			}

			const clamped = Math.max(0, Math.min(255, value))

			output[srcIdx] = clamped
			output[srcIdx + 1] = clamped
			output[srcIdx + 2] = clamped
			output[srcIdx + 3] = src[srcIdx + 3]!
		}
	}

	return new ImageData(output, width, height)
}

/**
 * Map-driven XDoG outline. The outline is computed from the source pixels and
 * then mixed back with the original by map luminance: black map → original,
 * white map → fully outlined.
 */
export function applyMappedOutline(
	pixels: ImageData,
	map: ImageData,
	sigma: number,
	kappa: number,
	epsilon: number,
	phi: number,
): ImageData {
	const outlined = applyOutline(pixels, sigma, kappa, epsilon, phi)

	return mixBlend(pixels, outlined, map)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface OutlineProps {
	/** Inner Gaussian σ in pixels. Larger σ produces thicker, softer lines. Default 1. */
	sigma?: number
	/** Outer-to-inner Gaussian σ ratio. The XDoG paper uses 1.6. Default 1.6. */
	k?: number
	/** XDoG threshold (after normalization to [-1, 1]). Default 0 — uniform regions of any luminance render white; only pixels where S falls below 0 (the dark side of edges) get sigmoid-darkened. Negative values produce thicker strokes; positive values darken low-luminance regions toward sketchy output. */
	epsilon?: number
	/** Sigmoid sharpness. Higher → more binary; lower → softer. Default 200. */
	phi?: number
	/** `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance. */
	mode?: "parameter" | "mix"
	map?: ReactNode
	children: ReactNode
}

/**
 * XDoG (Extended Difference of Gaussians) — stylized illustrative line art.
 *
 * Two Gaussian blurs at σ and k·σ are subtracted then mapped through a soft
 * tanh sigmoid to produce a drawn-looking edge response. Output is continuous
 * tonal; chain `Threshold` if you want hard binary outlines.
 *
 * - `sigma` — Inner Gaussian σ in pixels. Default 1.
 * - `k` — Outer-to-inner σ ratio. Default 1.6 (Winnemöller et al. 2012).
 * - `epsilon` — XDoG threshold (normalized [-1, 1]). Default 0 — produces canonical "drawn on white paper" output where uniform regions of any luminance stay white and only edge dark sides get drawn.
 * - `phi` — Sigmoid sharpness. Higher → more binary; lower → softer. Default 200.
 * - `mode` — `"parameter"` (default) applies the effect directly; `"mix"` blends via map luminance.
 *
 * @param props
 * @category Effects
 */
export function Outline({
	sigma = 1.0,
	k: kappa = 1.6,
	epsilon = 0,
	phi = 200,
	mode = "parameter",
	map,
	children,
}: OutlineProps) {
	const effect = useCallback<PipelineCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				if (mode === "parameter") {
					return applyMappedOutline(target, mapPixels, sigma, kappa, epsilon, phi)
				}

				const result = applyOutline(target, sigma, kappa, epsilon, phi)

				return mixBlend(target, result, mapPixels)
			}

			return applyOutline(target, sigma, kappa, epsilon, phi)
		},
		[sigma, kappa, epsilon, phi, mode],
	)

	return (
		<Pipeline effect={effect} map={map}>
			{children}
		</Pipeline>
	)
}
