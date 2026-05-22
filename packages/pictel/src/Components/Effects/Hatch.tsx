import type { ReactNode } from "react"
import { useCallback } from "react"
import { Pipeline, type PipelineCallback } from "../Pipeline/Pipeline"
import { applyGrayscale } from "./Grayscale"
import { applyLIC } from "./LIC"
import { applyPosterize } from "./Posterize"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

const DEFAULT_BANDS = 4
const DEFAULT_ANGLES = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4]
const DEFAULT_LENGTH = 20
const DEFAULT_STEP_SIZE = 1.0

/**
 * Contrast pass applied to the field-aligned LIC line layer. LIC of the
 * binary-noise seed produces a gray streak field; with the denser seed
 * (`buildNoiseSeed` black density ~0.17–0.4) the streak body's mean luminance
 * lands around 150–210. `LINE_CONTRAST_MIDPOINT = 200` sits at or just above
 * that mean, so the smoothstep pushes most of the streak body below its center
 * → dark, dense ink, while the brightest paper-white gaps (near 255) ride above
 * the upper edge and stay white. `LINE_CONTRAST_GAIN = 3.4` keeps a crisp ramp
 * between ink and paper.
 *
 * These values are deliberately *not* the most aggressive option: pushing the
 * midpoint to ~210 with a `3 / spacing` seed crushes the darkest band to a flat
 * black blob with no visible line texture. The values here keep the darkest
 * band dark and dense (~80% ink) while still resolving individual streaks.
 */
const LINE_CONTRAST_MIDPOINT = 200
const LINE_CONTRAST_GAIN = 3.4

/**
 * Build the per-pixel tier index buffer (0..bands-1) by applying Grayscale
 * then Posterize and reading back the quantized R channel. Each pixel's tier
 * value is `Math.round(255 * b / (bands - 1))` for tier index b — matches the
 * Posterize quantization formula exactly.
 */
function computeTierBuffer(pixels: ImageData, bands: number): { tierBuffer: ImageData; tierValues: Array<number> } {
	const grayBuffer = applyGrayscale(pixels, 1)
	const tierBuffer = applyPosterize(grayBuffer, bands)
	const tierValues: Array<number> = []
	const denom = Math.max(1, bands - 1)

	for (let bandIdx = 0; bandIdx < bands; bandIdx++) {
		tierValues.push(Math.round((255 * bandIdx) / denom))
	}

	return { tierBuffer, tierValues }
}

/**
 * Constant-angle hatching. Bands the source image into `bands` tonal tiers
 * (Grayscale → Posterize) and overlays a per-band line pattern at
 * `angles[b]` with `spacing[b]`. The lightest band draws no lines (pure
 * white). Lines are composited via Multiply, so darker bands accumulate
 * darker hatching. Output preserves the source alpha.
 *
 * Angle convention (matches CSS `linear-gradient`, SVG, and standard graphics
 * tools): `angle=0` produces horizontal lines, `angle=π/2` produces vertical
 * lines, increasing CCW. The angle names the line orientation, not the line
 * normal.
 */
export function applyHatch(
	pixels: ImageData,
	bands: number,
	angles: Array<number>,
	spacing: Array<number>,
): ImageData {
	if (angles.length !== bands) {
		throw new Error(
			`applyHatch: angles.length (${String(angles.length)}) must equal bands (${String(bands)})`,
		)
	}

	if (spacing.length !== bands) {
		throw new Error(
			`applyHatch: spacing.length (${String(spacing.length)}) must equal bands (${String(bands)})`,
		)
	}

	const { width, height, data: src } = pixels
	const { tierBuffer, tierValues } = computeTierBuffer(pixels, bands)
	const tierData = tierBuffer.data

	const output = new Uint8ClampedArray(src.length)

	for (let pixelIdx = 0; pixelIdx < src.length; pixelIdx += 4) {
		output[pixelIdx] = 255
		output[pixelIdx + 1] = 255
		output[pixelIdx + 2] = 255
		output[pixelIdx + 3] = src[pixelIdx + 3]!
	}

	for (let bandIdx = 0; bandIdx < bands - 1; bandIdx++) {
		const tierValue = tierValues[bandIdx]!
		const angle = angles[bandIdx]!
		const bandSpacing = Math.max(1, spacing[bandIdx]!)
		const lineWidth = Math.max(1, bandSpacing * 0.3)
		const cosA = Math.cos(angle)
		const sinA = Math.sin(angle)

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const pixelIdx = (y * width + x) * 4

				if (tierData[pixelIdx]! !== tierValue) continue

				// Standard graphics convention: angle=0 → horizontal lines, angle=π/2 → vertical.
				// `position` measures perpendicular distance to a line through the origin at `angle`.
				const position = y * cosA - x * sinA
				// Use a positive-modulo so negative positions still map onto the stripe.
				const mod = ((position % bandSpacing) + bandSpacing) % bandSpacing

				if (mod < lineWidth) {
					// Multiply by black = 0
					output[pixelIdx] = 0
					output[pixelIdx + 1] = 0
					output[pixelIdx + 2] = 0
				}
			}
		}
	}

	return new ImageData(output, width, height)
}

/**
 * Deterministic mulberry32 PRNG. A fixed integer seed yields a fixed stream
 * of floats in [0, 1) — used so field-aligned hatch noise is stable across
 * renders (no `Math.random()`).
 */
function mulberry32(seed: number): () => number {
	let state = seed | 0

	return () => {
		state = (state + 0x6d2b79f5) | 0
		let hash = Math.imul(state ^ (state >>> 15), 1 | state)
		hash = (hash + Math.imul(hash ^ (hash >>> 7), 61 | hash)) ^ hash

		return ((hash ^ (hash >>> 14)) >>> 0) / 0xffffffff
	}
}

/** Fixed base seed for field-aligned hatch noise — keeps demo output stable. */
const NOISE_SEED_BASE = 0x9e3779b9

/**
 * Build an isotropic binary-noise seed image for image-guided LIC. Each pixel
 * is independently black (0) with probability `blackProbability`, white (255)
 * otherwise. Unlike a directional stripe seed, white noise has high-frequency
 * content in *every* orientation, so LIC of this seed along a vector field
 * produces streamline texture that follows the field in all directions — the
 * classic, correct LIC seeding choice (Cabral & Leedom 1993).
 *
 * Black-pixel density is tied to the band's spacing by the caller: tighter
 * spacing → higher `blackProbability` → denser, darker streamline hatching
 * after LIC; looser spacing → sparser, fainter hatching.
 *
 * `bandIdx` derives a distinct PRNG stream per band so bands do not share
 * identical noise. Alpha is 255 throughout — alpha is reapplied from source
 * on the final composite.
 */
function buildNoiseSeed(
	width: number,
	height: number,
	blackProbability: number,
	bandIdx: number,
): ImageData {
	const data = new Uint8ClampedArray(width * height * 4)
	const rng = mulberry32(NOISE_SEED_BASE + bandIdx * 0x85ebca6b)
	const probability = Math.min(1, Math.max(0, blackProbability))

	for (let pixelIdx = 0; pixelIdx < data.length; pixelIdx += 4) {
		const value = rng() < probability ? 0 : 255
		data[pixelIdx] = value
		data[pixelIdx + 1] = value
		data[pixelIdx + 2] = value
		data[pixelIdx + 3] = 255
	}

	return new ImageData(data, width, height)
}

/**
 * Contrast/threshold pass that turns the soft gray streaks produced by LIC of
 * a noise seed into crisp ink lines. Applies a smoothstep around `midpoint`
 * with steepness `gain`: values below the lower edge collapse to black, above
 * the upper edge to white, with a short smooth ramp between. R=G=B are treated
 * as a single luminance value (the LIC seed is grayscale); alpha is preserved.
 */
function sharpenLineLayer(layer: ImageData, midpoint: number, gain: number): ImageData {
	const src = layer.data
	const output = new Uint8ClampedArray(src.length)
	const halfWidth = Math.max(1, 255 / (2 * gain))
	const lowEdge = midpoint - halfWidth
	const highEdge = midpoint + halfWidth
	const span = highEdge - lowEdge

	for (let pixelIdx = 0; pixelIdx < src.length; pixelIdx += 4) {
		const value = src[pixelIdx]!
		let ramp = (value - lowEdge) / span
		ramp = ramp < 0 ? 0 : ramp > 1 ? 1 : ramp
		// smoothstep
		const eased = ramp * ramp * (3 - 2 * ramp)
		const result = Math.round(eased * 255)
		output[pixelIdx] = result
		output[pixelIdx + 1] = result
		output[pixelIdx + 2] = result
		output[pixelIdx + 3] = src[pixelIdx + 3]!
	}

	return new ImageData(output, layer.width, layer.height)
}

/**
 * Field-aligned hatching. Same banding pipeline as `applyHatch`, but each
 * band's line layer is generated by passing an **isotropic binary-noise** seed
 * through `applyLIC` with the supplied `field`. LIC smears the white noise
 * along the field's streamlines; because white noise carries high-frequency
 * content in every orientation, the resulting streamline texture follows the
 * field in *all* directions — hatching that curves around the form rather than
 * a directional stripe seed that only resolves where the field happens to be
 * perpendicular to it. This is the classic, correct LIC seeding choice
 * (Cabral & Leedom 1993).
 *
 * Per-band tone is driven by the `spacing` array: a band's black-pixel noise
 * probability is `min(0.5, 2 / bandSpacing)`, so a tighter (darker) band gets
 * denser black noise and therefore darker, denser streamline hatching after
 * LIC; a looser band gets sparser, fainter hatching. The LIC output — gray
 * streaks — is then run through a smoothstep contrast pass (midpoint near the
 * streak mean) so the streak body resolves to dark, dense ink with paper-white
 * gaps, and multiplied onto the white output for the matching tier.
 *
 * `uniformStep` is forwarded to `applyLIC`: with a smooth field (e.g. a
 * structure-tensor field) leave it true so the noise is actually carried along
 * the field; the default magnitude-gated step stalls on smooth fields.
 *
 * Cost: a full LIC integration runs per band — `O(width * height * length *
 * bands)` sample reads. For `bands=4`, `length=20`, 1080×1080 the cost is on
 * the order of 93M sample reads; acceptable for static demos.
 */
export function applyHatchFieldAligned(
	pixels: ImageData,
	field: ImageData,
	bands: number,
	spacing: Array<number>,
	length: number,
	stepSize: number,
	uniformStep = false,
): ImageData {
	if (pixels.width !== field.width || pixels.height !== field.height) {
		throw new Error(
			`applyHatchFieldAligned: pixels and field dimensions must match (pixels=${String(pixels.width)}x${String(pixels.height)}, field=${String(field.width)}x${String(field.height)})`,
		)
	}

	if (spacing.length !== bands) {
		throw new Error(
			`applyHatchFieldAligned: spacing.length (${String(spacing.length)}) must equal bands (${String(bands)})`,
		)
	}

	const { width, height, data: src } = pixels
	const { tierBuffer, tierValues } = computeTierBuffer(pixels, bands)
	const tierData = tierBuffer.data

	const output = new Uint8ClampedArray(src.length)

	for (let pixelIdx = 0; pixelIdx < src.length; pixelIdx += 4) {
		output[pixelIdx] = 255
		output[pixelIdx + 1] = 255
		output[pixelIdx + 2] = 255
		output[pixelIdx + 3] = src[pixelIdx + 3]!
	}

	for (let bandIdx = 0; bandIdx < bands - 1; bandIdx++) {
		const tierValue = tierValues[bandIdx]!
		const bandSpacing = Math.max(1, spacing[bandIdx]!)

		// Black-pixel density tied to spacing: tighter spacing → denser noise →
		// darker hatching after LIC. `2 / bandSpacing` yields ~0.4/0.25/0.167
		// black density for the demo's [5,8,12] spacings, so LIC averages a
		// genuinely dark streak field (mean ~150–210) rather than the near-white
		// one the old `1 / bandSpacing` formula produced. The 0.5 cap keeps
		// ample white noise for LIC to resolve clean streamlines; pushing the
		// density higher (e.g. `3 / spacing`) crushes the tightest band to a
		// flat black blob with no visible line texture once it is sharpened.
		const blackProbability = Math.min(0.5, 2 / bandSpacing)
		const seed = buildNoiseSeed(width, height, blackProbability, bandIdx)
		const streamlines = applyLIC(seed, field, length, stepSize, uniformStep)
		// LIC of noise is a soft gray streak field — push it to crisp ink lines.
		const lineLayer = sharpenLineLayer(streamlines, LINE_CONTRAST_MIDPOINT, LINE_CONTRAST_GAIN)
		const lineData = lineLayer.data

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const pixelIdx = (y * width + x) * 4

				if (tierData[pixelIdx]! !== tierValue) continue

				// Multiply: out = out * line / 255 per channel
				output[pixelIdx] = Math.round((output[pixelIdx]! * lineData[pixelIdx]!) / 255)
				output[pixelIdx + 1] = Math.round((output[pixelIdx + 1]! * lineData[pixelIdx + 1]!) / 255)
				output[pixelIdx + 2] = Math.round((output[pixelIdx + 2]! * lineData[pixelIdx + 2]!) / 255)
			}
		}
	}

	return new ImageData(output, width, height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface HatchProps {
	/** Number of tonal bands. Minimum 2. Default 4. */
	bands?: number
	/** Per-band line angles in radians. Required in constant-angle mode (no `map` prop). Length must equal `bands`. */
	angles?: Array<number>
	/** Per-band line spacing in pixels. Length must equal `bands`. In constant-angle mode this is the literal stripe period; in field-aligned mode it drives the noise-seed density (`min(0.5, 2 / spacing)`) so tighter spacing yields darker hatching. */
	spacing: Array<number>
	/** Field-aligned LIC integration length per direction. Default 20. */
	length?: number
	/** Field-aligned LIC step size in pixels. Default 1.0. */
	stepSize?: number
	/** Field-aligned mode: integrate at a constant step length, ignoring the field's magnitude channel. Default false. Set true when the `map` is a smooth field (e.g. a depth gradient) so the lines actually follow it. */
	uniformStep?: boolean
	map?: ReactNode
	children: ReactNode
}

/**
 * Hatching effect. Bands the source into tonal tiers (Grayscale → Posterize)
 * and renders per-band line layers, multiplied onto a white background. Two
 * modes:
 *
 * - **Constant-angle** (no `map` prop): each band uses a fixed angle and
 *   spacing. Pass `angles` and `spacing` arrays of length `bands`.
 * - **Field-aligned** (with `map` prop): each band's lines are produced by
 *   running an isotropic binary-noise seed through LIC along the supplied
 *   vector field, then sharpening the result into crisp ink. The streamlines
 *   curve to follow the field in every orientation. The map is expected to be
 *   a Direction-style cos/sin/magnitude encoding (see `Direction`). Per-band
 *   `spacing` sets the noise density (`min(0.5, 2 / spacing)`) and so the
 *   tonal progression. For a smooth field (e.g. a structure-tensor field), set
 *   `uniformStep` so the lines follow it — the default magnitude-gated step
 *   stalls on smooth fields.
 *
 * The lightest band draws no lines — it stays pure white. Output preserves
 * the source alpha.
 *
 * @param props
 * @category Effects
 */
export function Hatch({
	bands = DEFAULT_BANDS,
	angles,
	spacing,
	length = DEFAULT_LENGTH,
	stepSize = DEFAULT_STEP_SIZE,
	uniformStep = false,
	map,
	children,
}: HatchProps) {
	if (bands < 2) {
		throw new Error(`Hatch: bands must be >= 2 (got ${String(bands)})`)
	}

	if (spacing.length !== bands) {
		throw new Error(
			`Hatch: spacing.length (${String(spacing.length)}) must equal bands (${String(bands)})`,
		)
	}

	if (angles && angles.length !== bands) {
		throw new Error(
			`Hatch: angles.length (${String(angles.length)}) must equal bands (${String(bands)})`,
		)
	}

	const resolvedAngles = angles ?? (bands === DEFAULT_BANDS ? DEFAULT_ANGLES : undefined)

	const effect = useCallback<PipelineCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				// Field-aligned mode: map prop present, use vector field via LIC
				return applyHatchFieldAligned(target, mapPixels, bands, spacing, length, stepSize, uniformStep)
			}

			// Constant-angle mode: no map prop
			if (!resolvedAngles) {
				throw new Error(
					`Hatch: angles is required in constant-angle mode when bands !== ${String(DEFAULT_BANDS)} (no map prop supplied)`,
				)
			}

			return applyHatch(target, bands, resolvedAngles, spacing)
		},
		[bands, resolvedAngles, spacing, length, stepSize, uniformStep],
	)

	return (
		<Pipeline effect={effect} map={map}>
			{children}
		</Pipeline>
	)
}
