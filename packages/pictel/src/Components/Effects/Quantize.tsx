import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect } from "../Pipeline/RasterEffect"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

type Rgb = readonly [number, number, number]

/**
 * Returns the index of the palette entry minimizing squared Euclidean RGB distance.
 * Linear scan; palettes are small (typically ≤ 64) so no acceleration structure is needed.
 */
function nearestColor(red: number, green: number, blue: number, palette: ReadonlyArray<Rgb>): number {
	let bestIndex = 0
	let bestDistance = Infinity

	for (let index = 0; index < palette.length; index++) {
		const entry = palette[index]!
		const dr = red - entry[0]
		const dg = green - entry[1]
		const db = blue - entry[2]
		const distance = dr * dr + dg * dg + db * db

		if (distance < bestDistance) {
			bestDistance = distance
			bestIndex = index
		}
	}

	return bestIndex
}

interface MedianCutBucket {
	readonly samples: ReadonlyArray<Rgb>
}

/**
 * Median-cut palette derivation. Recursively splits the bucket with the longest
 * channel range at the median of that channel until `count` buckets exist; the
 * final palette is the per-channel mean of each bucket.
 *
 * Throws if the input has fewer than `count` unique colors — that's a configuration error.
 *
 * @param pixels Source image. Fully transparent pixels are ignored.
 * @param count Target palette size. Must be ≥ 1.
 */
export function derivePalette(pixels: ImageData, count: number): Array<[number, number, number]> {
	if (count < 1) throw new Error(`derivePalette: count must be ≥ 1 (received ${count})`)

	const { data } = pixels
	const totalPixels = (data.length / 4) | 0
	const stride = Math.max(1, Math.floor(totalPixels / 50000))

	const samples: Array<Rgb> = []
	const uniqueKeys = new Set<number>()

	for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex += stride) {
		const offset = pixelIndex * 4

		if (data[offset + 3] === 0) continue

		const red = data[offset]!
		const green = data[offset + 1]!
		const blue = data[offset + 2]!

		samples.push([red, green, blue])
		uniqueKeys.add((red << 16) | (green << 8) | blue)
	}

	if (uniqueKeys.size < count) {
		throw new Error(
			`derivePalette: image has ${uniqueKeys.size} unique color${uniqueKeys.size === 1 ? "" : "s"}, fewer than the requested count of ${count}. Reduce count or supply a fixed palette.`,
		)
	}

	const buckets: Array<MedianCutBucket> = [{ samples }]

	while (buckets.length < count) {
		// Find bucket with longest dimension across R/G/B.
		let targetIndex = -1
		let targetChannel: 0 | 1 | 2 = 0
		let targetRange = -1

		for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex++) {
			const bucket = buckets[bucketIndex]!

			if (bucket.samples.length < 2) continue

			let minR = 255, minG = 255, minB = 255
			let maxR = 0, maxG = 0, maxB = 0

			for (const sample of bucket.samples) {
				if (sample[0] < minR) minR = sample[0]

				if (sample[0] > maxR) maxR = sample[0]

				if (sample[1] < minG) minG = sample[1]

				if (sample[1] > maxG) maxG = sample[1]

				if (sample[2] < minB) minB = sample[2]

				if (sample[2] > maxB) maxB = sample[2]
			}

			const rangeR = maxR - minR
			const rangeG = maxG - minG
			const rangeB = maxB - minB
			const longestRange = Math.max(rangeR, rangeG, rangeB)
			const channel = longestRange === rangeR ? 0 : longestRange === rangeG ? 1 : 2

			if (longestRange > targetRange) {
				targetRange = longestRange
				targetIndex = bucketIndex
				targetChannel = channel
			}
		}

		if (targetIndex === -1 || targetRange <= 0) {
			// All remaining buckets are degenerate (single sample or zero range).
			// We've already verified uniqueKeys.size >= count, so this shouldn't
			// happen; bail to avoid infinite loop.
			break
		}

		const target = buckets[targetIndex]!
		const sorted = [...target.samples].sort((first, second) => first[targetChannel] - second[targetChannel])
		const mid = sorted.length >> 1

		const left: MedianCutBucket = { samples: sorted.slice(0, mid) }
		const right: MedianCutBucket = { samples: sorted.slice(mid) }

		buckets.splice(targetIndex, 1, left, right)
	}

	return buckets.map((bucket) => {
		let sumR = 0, sumG = 0, sumB = 0

		for (const sample of bucket.samples) {
			sumR += sample[0]
			sumG += sample[1]
			sumB += sample[2]
		}

		const sampleCount = bucket.samples.length

		return [
			Math.round(sumR / sampleCount),
			Math.round(sumG / sampleCount),
			Math.round(sumB / sampleCount),
		] as [number, number, number]
	})
}

// Bayer 4×4 matrix (canonical), divided by 16, shifted to [-0.5, 0.5).
const BAYER_4: ReadonlyArray<number> = [
	0, 8, 2, 10,
	12, 4, 14, 6,
	3, 11, 1, 9,
	15, 7, 13, 5,
].map((value) => value / 16 - 0.5)

// Bayer 8×8 matrix (canonical), divided by 64, shifted to [-0.5, 0.5).
const BAYER_8: ReadonlyArray<number> = [
	0, 32, 8, 40, 2, 34, 10, 42,
	48, 16, 56, 24, 50, 18, 58, 26,
	12, 44, 4, 36, 14, 46, 6, 38,
	60, 28, 52, 20, 62, 30, 54, 22,
	3, 35, 11, 43, 1, 33, 9, 41,
	51, 19, 59, 27, 49, 17, 57, 25,
	15, 47, 7, 39, 13, 45, 5, 37,
	63, 31, 55, 23, 61, 29, 53, 21,
].map((value) => value / 64 - 0.5)

const BAYER_SCALE = 64

export type DitherMode = "none" | "floyd-steinberg" | "atkinson" | "bayer-4" | "bayer-8"

function clamp255(value: number): number {
	if (value < 0) return 0

	if (value > 255) return 255

	return value
}

/**
 * Maps each pixel to its nearest palette color, optionally with dithering.
 *
 * Floyd–Steinberg and Atkinson use error diffusion in raster order with a
 * Float32 working buffer. Bayer-4 and Bayer-8 are ordered dithering with the
 * canonical matrix.
 */
export function applyQuantize(
	pixels: ImageData,
	palette: ReadonlyArray<Rgb>,
	dither: DitherMode = "none",
): ImageData {
	if (palette.length === 0) throw new Error("applyQuantize: palette must contain at least one color")

	const { width, height, data: src } = pixels
	const output = new Uint8ClampedArray(src.length)

	if (dither === "none") {
		for (let px = 0; px < src.length; px += 4) {
			const paletteIndex = nearestColor(src[px]!, src[px + 1]!, src[px + 2]!, palette)
			const entry = palette[paletteIndex]!
			output[px] = entry[0]
			output[px + 1] = entry[1]
			output[px + 2] = entry[2]
			output[px + 3] = src[px + 3]!
		}

		return new ImageData(output, width, height)
	}

	if (dither === "bayer-4" || dither === "bayer-8") {
		const matrix = dither === "bayer-4" ? BAYER_4 : BAYER_8
		const size = dither === "bayer-4" ? 4 : 8

		for (let yy = 0; yy < height; yy++) {
			for (let xx = 0; xx < width; xx++) {
				const px = (yy * width + xx) * 4
				const threshold = matrix[(yy % size) * size + (xx % size)]! * BAYER_SCALE
				const red = clamp255(src[px]! + threshold)
				const green = clamp255(src[px + 1]! + threshold)
				const blue = clamp255(src[px + 2]! + threshold)
				const paletteIndex = nearestColor(red, green, blue, palette)
				const entry = palette[paletteIndex]!
				output[px] = entry[0]
				output[px + 1] = entry[1]
				output[px + 2] = entry[2]
				output[px + 3] = src[px + 3]!
			}
		}

		return new ImageData(output, width, height)
	}

	// Error-diffusion (Floyd–Steinberg or Atkinson).
	const buffer = new Float32Array(width * height * 3)

	for (let srcIndex = 0, bufIndex = 0; srcIndex < src.length; srcIndex += 4, bufIndex += 3) {
		buffer[bufIndex] = src[srcIndex]!
		buffer[bufIndex + 1] = src[srcIndex + 1]!
		buffer[bufIndex + 2] = src[srcIndex + 2]!
	}

	const distribute =
		dither === "floyd-steinberg"
			? (xx: number, yy: number, errR: number, errG: number, errB: number) => {
				// Floyd–Steinberg: 7/16 E, 3/16 SW, 5/16 S, 1/16 SE
				diffuse(buffer, width, height, xx + 1, yy, errR, errG, errB, 7 / 16)
				diffuse(buffer, width, height, xx - 1, yy + 1, errR, errG, errB, 3 / 16)
				diffuse(buffer, width, height, xx, yy + 1, errR, errG, errB, 5 / 16)
				diffuse(buffer, width, height, xx + 1, yy + 1, errR, errG, errB, 1 / 16)
			}
			: (xx: number, yy: number, errR: number, errG: number, errB: number) => {
				// Atkinson: 1/8 each to E, EE, SW, S, SE, SS — only 6/8 propagated
				const weight = 1 / 8
				diffuse(buffer, width, height, xx + 1, yy, errR, errG, errB, weight)
				diffuse(buffer, width, height, xx + 2, yy, errR, errG, errB, weight)
				diffuse(buffer, width, height, xx - 1, yy + 1, errR, errG, errB, weight)
				diffuse(buffer, width, height, xx, yy + 1, errR, errG, errB, weight)
				diffuse(buffer, width, height, xx + 1, yy + 1, errR, errG, errB, weight)
				diffuse(buffer, width, height, xx, yy + 2, errR, errG, errB, weight)
			}

	for (let yy = 0; yy < height; yy++) {
		for (let xx = 0; xx < width; xx++) {
			const bufIndex = (yy * width + xx) * 3
			const red = clamp255(buffer[bufIndex]!)
			const green = clamp255(buffer[bufIndex + 1]!)
			const blue = clamp255(buffer[bufIndex + 2]!)
			const paletteIndex = nearestColor(red, green, blue, palette)
			const entry = palette[paletteIndex]!

			const px = (yy * width + xx) * 4
			output[px] = entry[0]
			output[px + 1] = entry[1]
			output[px + 2] = entry[2]
			output[px + 3] = src[px + 3]!

			const errR = red - entry[0]
			const errG = green - entry[1]
			const errB = blue - entry[2]

			distribute(xx, yy, errR, errG, errB)
		}
	}

	return new ImageData(output, width, height)
}

function diffuse(
	buffer: Float32Array,
	width: number,
	height: number,
	xx: number,
	yy: number,
	errR: number,
	errG: number,
	errB: number,
	weight: number,
): void {
	if (xx < 0 || xx >= width || yy < 0 || yy >= height) return

	const offset = (yy * width + xx) * 3
	buffer[offset] = buffer[offset]! + errR * weight
	buffer[offset + 1] = buffer[offset + 1]! + errG * weight
	buffer[offset + 2] = buffer[offset + 2]! + errB * weight
}

/**
 * Same as `applyQuantize` but the quantized result is mixed with the original
 * pixels by the map's luminance. Map=black returns the original; map=white
 * returns the fully quantized output.
 */
export function applyMappedQuantize(
	pixels: ImageData,
	map: ImageData,
	palette: ReadonlyArray<Rgb>,
	dither: DitherMode = "none",
): ImageData {
	const quantized = applyQuantize(pixels, palette, dither)

	return mixBlend(pixels, quantized, map)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

export interface QuantizeProps {
	/** Fixed palette. Mutually exclusive with `count`. */
	palette?: ReadonlyArray<Rgb>
	/** Auto-derive a palette of this size from the source via median-cut. Mutually exclusive with `palette`. */
	count?: number
	/** Dithering algorithm. Default `"none"`. */
	dither?: DitherMode
	mode?: "parameter" | "mix"
	backdrop?: boolean
	children: ReactNode
}

/**
 * Maps the image to a restricted color palette. Either a fixed `palette` (an
 * array of `[r, g, b]` triples) or an auto-derived palette of `count` colors
 * via median-cut. `palette` and `count` are mutually exclusive.
 *
 * Dither modes:
 * - `"none"` — flat nearest-color mapping
 * - `"floyd-steinberg"` — error diffusion (sharp, classic GIF look)
 * - `"atkinson"` — error diffusion with 6/8 propagation (Mac System 1 look)
 * - `"bayer-4"` / `"bayer-8"` — ordered dithering (deterministic crosshatch pattern)
 *
 * @param props
 * @category Effects
 */
export function Quantize({ palette, count, dither, mode, backdrop, children }: QuantizeProps) {
	if (palette !== undefined && count !== undefined) {
		throw new Error(
			"Quantize: `palette` and `count` are mutually exclusive — supply one or the other, not both.",
		)
	}

	if (palette === undefined && count === undefined) {
		throw new Error(
			"Quantize: exactly one of `palette` or `count` must be supplied (palette=fixed colors, count=auto via median-cut).",
		)
	}

	const ditherMode = dither ?? "none"

	const effect = useCallback(
		(pixels: ImageData) => {
			const resolvedPalette = palette ?? derivePalette(pixels, count ?? 0)

			return applyQuantize(pixels, resolvedPalette, ditherMode)
		},
		[palette, count, ditherMode],
	)

	const mappedEffect = useCallback(
		(pixels: ImageData, map: ImageData) => {
			const resolvedPalette = palette ?? derivePalette(pixels, count ?? 0)

			return applyMappedQuantize(pixels, map, resolvedPalette, ditherMode)
		},
		[palette, count, ditherMode],
	)

	return (
		<RasterEffect effect={effect} mappedEffect={mappedEffect} mode={mode} backdrop={backdrop}>
			{children}
		</RasterEffect>
	)
}
