import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { applyLicWithStreamlines, computeStreamlines } from "./LIC"
import { computeTierBuffer } from "./utils/compute-tier-buffer"
import { mulberry32 } from "./utils/mulberry32"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

const DEFAULT_BANDS = 4
const DEFAULT_ANGLES = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4]
const DEFAULT_LENGTH = 20
const DEFAULT_STEP_SIZE = 1.0

const LINE_CONTRAST_MIDPOINT = 200
const LINE_CONTRAST_GAIN = 3.4

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

				const position = y * cosA - x * sinA
				const mod = ((position % bandSpacing) + bandSpacing) % bandSpacing

				if (mod < lineWidth) {
					output[pixelIdx] = 0
					output[pixelIdx + 1] = 0
					output[pixelIdx + 2] = 0
				}
			}
		}
	}

	return new ImageData(output, width, height)
}

const NOISE_SEED_BASE = 0x9e3779b9

function buildNoiseSeed(
	width: number,
	height: number,
	blackProbability: number,
	bandIdx: number,
	into?: Uint8ClampedArray<ArrayBuffer>,
): ImageData {
	const data: Uint8ClampedArray<ArrayBuffer> = into ?? new Uint8ClampedArray(width * height * 4)
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
		const eased = ramp * ramp * (3 - 2 * ramp)
		const result = Math.round(eased * 255)
		output[pixelIdx] = result
		output[pixelIdx + 1] = result
		output[pixelIdx + 2] = result
		output[pixelIdx + 3] = src[pixelIdx + 3]!
	}

	return new ImageData(output, layer.width, layer.height)
}

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

	const streamlines = computeStreamlines(field, length, stepSize, uniformStep)
	const seedBuffer: Uint8ClampedArray<ArrayBuffer> = new Uint8ClampedArray(width * height * 4)

	for (let bandIdx = 0; bandIdx < bands - 1; bandIdx++) {
		const tierValue = tierValues[bandIdx]!
		const bandSpacing = Math.max(1, spacing[bandIdx]!)

		const blackProbability = Math.min(0.5, 2 / bandSpacing)
		const seed = buildNoiseSeed(width, height, blackProbability, bandIdx, seedBuffer)
		const licOutput = applyLicWithStreamlines(seed, streamlines)
		const lineLayer = sharpenLineLayer(licOutput, LINE_CONTRAST_MIDPOINT, LINE_CONTRAST_GAIN)
		const lineData = lineLayer.data

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const pixelIdx = (y * width + x) * 4

				if (tierData[pixelIdx]! !== tierValue) continue

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
	bands?: number
	angles?: Array<number>
	spacing: Array<number>
	length?: number
	stepSize?: number
	uniformStep?: boolean
	map?: ReactNode
	children: ReactNode
	version?: string
}

/**
 * Renders the source as tonal bands of ink hatching on white. Two modes:
 *
 * - **Constant-angle** (no `map` prop): each band uses a fixed angle and
 *   spacing. Pass `angles` and `spacing` arrays of length `bands`.
 * - **Field-aligned** (with `map` prop): hatching follows the supplied
 *   direction field, so the strokes curve around the form. The `map` is
 *   expected to be a `Direction`-style field (see `Direction`). The
 *   lightest band stays pure white. Source alpha is preserved.
 *
 * - `bands` — Number of tonal tiers. Minimum 2. Default 4.
 * - `angles` — Per-band line angles in radians (constant-angle mode). Length must equal `bands`.
 * - `spacing` — Per-band line spacing in pixels. Length must equal `bands`. In constant-angle mode this is the literal stripe period; in field-aligned mode it controls per-band density (tighter spacing yields darker hatching).
 * - `length` — Field-aligned integration length per direction. Default 20.
 * - `stepSize` — Field-aligned step size in pixels. Default 1.0.
 * - `uniformStep` — Field-aligned mode: integrate at a constant step length, ignoring the field's magnitude channel. Default false. Set true when the map is a smooth field (e.g. a depth gradient) so the lines actually follow it.
 * - `map` — Optional direction field as JSX. When provided, switches to field-aligned mode and the hatching follows the field.
 * - `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.
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
	version,
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

	const internal = `hatch@1+b=${bands}+a=${resolvedAngles ? JSON.stringify(resolvedAngles) : "_"}+s=${JSON.stringify(spacing)}+l=${length}+t=${stepSize}+u=${uniformStep}`
	const composedVersion = version === undefined ? internal : `${internal}+${version}`

	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				return applyHatchFieldAligned(target, mapPixels, bands, spacing, length, stepSize, uniformStep)
			}

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
		<RasterEffect effect={effect} map={map} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
