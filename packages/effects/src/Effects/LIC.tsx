import { useCallback, type ReactNode } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

function sampleBilinear(image: ImageData, x: number, y: number): [number, number, number, number] {
	const { width, height, data } = image

	const maxX = width - 1
	const maxY = height - 1
	const cx = x < 0 ? 0 : x > maxX ? maxX : x
	const cy = y < 0 ? 0 : y > maxY ? maxY : y

	const x0 = Math.floor(cx)
	const y0 = Math.floor(cy)
	const x1 = x0 + 1 < maxX ? x0 + 1 : maxX
	const y1 = y0 + 1 < maxY ? y0 + 1 : maxY

	const fx = cx - x0
	const fy = cy - y0

	const i00 = (y0 * width + x0) * 4
	const i10 = (y0 * width + x1) * 4
	const i01 = (y1 * width + x0) * 4
	const i11 = (y1 * width + x1) * 4

	const w00 = (1 - fx) * (1 - fy)
	const w10 = fx * (1 - fy)
	const w01 = (1 - fx) * fy
	const w11 = fx * fy

	const red = data[i00]! * w00 + data[i10]! * w10 + data[i01]! * w01 + data[i11]! * w11
	const green = data[i00 + 1]! * w00 + data[i10 + 1]! * w10 + data[i01 + 1]! * w01 + data[i11 + 1]! * w11
	const blue = data[i00 + 2]! * w00 + data[i10 + 2]! * w10 + data[i01 + 2]! * w01 + data[i11 + 2]! * w11
	const alpha = data[i00 + 3]! * w00 + data[i10 + 3]! * w10 + data[i01 + 3]! * w01 + data[i11 + 3]! * w11

	return [red, green, blue, alpha]
}

/**
 * Cached streamline geometry. `forwardX/forwardY/backwardX/backwardY` are
 * `width * height * length` Float64Arrays indexed as `(y * width + x) * length + step`
 * holding the sample coordinates traced through the field for each pixel. Float64
 * preserves the original JS-number precision of the integration step, keeping
 * the seed-convolution output byte-identical to the single-pass implementation.
 * `weights` is the per-step weight `1 - step / length`, shared between forward
 * and backward traversals.
 */
export interface StreamlineMap {
	readonly width: number
	readonly height: number
	readonly length: number
	readonly forwardX: Float64Array
	readonly forwardY: Float64Array
	readonly backwardX: Float64Array
	readonly backwardY: Float64Array
	readonly weights: Float32Array
}

/**
 * Trace the per-pixel forward and backward streamlines of a Direction-style
 * cos/sin/magnitude field once, so multiple seed convolutions (e.g. per-band
 * in field-aligned `Hatch`) can reuse the cached geometry.
 */
export function computeStreamlines(
	field: ImageData,
	length: number,
	stepSize: number,
	uniformStep = false,
): StreamlineMap {
	const { width, height } = field
	const pixelCount = width * height
	const sampleCount = pixelCount * length

	const forwardX = new Float64Array(sampleCount)
	const forwardY = new Float64Array(sampleCount)
	const backwardX = new Float64Array(sampleCount)
	const backwardY = new Float64Array(sampleCount)

	const weights = new Float32Array(length)

	for (let step = 0; step < length; step++) {
		weights[step] = 1 - step / length
	}

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const baseIdx = (y * width + x) * length

			let fx = x
			let fy = y

			for (let step = 0; step < length; step++) {
				const fieldSample = sampleBilinear(field, fx, fy)
				const cos = fieldSample[0] / 127.5 - 1
				const sin = fieldSample[1] / 127.5 - 1
				const magnitude = fieldSample[2] / 255
				const stepLength = uniformStep ? stepSize : stepSize * (0.25 + 0.75 * magnitude)

				fx += cos * stepLength
				fy += sin * stepLength

				forwardX[baseIdx + step] = fx
				forwardY[baseIdx + step] = fy
			}

			let bx = x
			let by = y

			for (let step = 0; step < length; step++) {
				const fieldSample = sampleBilinear(field, bx, by)
				const cos = fieldSample[0] / 127.5 - 1
				const sin = fieldSample[1] / 127.5 - 1
				const magnitude = fieldSample[2] / 255
				const stepLength = uniformStep ? stepSize : stepSize * (0.25 + 0.75 * magnitude)

				bx -= cos * stepLength
				by -= sin * stepLength

				backwardX[baseIdx + step] = bx
				backwardY[baseIdx + step] = by
			}
		}
	}

	return { width, height, length, forwardX, forwardY, backwardX, backwardY, weights }
}

/**
 * Convolve a seed image along precomputed streamlines. The per-step weight is
 * shared between forward and backward halves (precomputed in the StreamlineMap),
 * so total `weightSum` per pixel is `2 * sum(weights)`.
 */
export function applyLicWithStreamlines(seed: ImageData, streamlines: StreamlineMap): ImageData {
	const { width, height, length, forwardX, forwardY, backwardX, backwardY, weights } = streamlines

	if (seed.width !== width || seed.height !== height) {
		throw new Error(
			`applyLicWithStreamlines: seed and streamlines dimensions must match (seed=${String(seed.width)}x${String(seed.height)}, streamlines=${String(width)}x${String(height)})`,
		)
	}

	const seedData = seed.data
	const output = new Uint8ClampedArray(seedData.length)

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let accumR = 0
			let accumG = 0
			let accumB = 0
			let weightSum = 0

			const baseIdx = (y * width + x) * length

			for (let step = 0; step < length; step++) {
				const sx = forwardX[baseIdx + step]!
				const sy = forwardY[baseIdx + step]!
				const seedSample = sampleBilinear(seed, sx, sy)
				const weight = weights[step]!
				accumR += seedSample[0] * weight
				accumG += seedSample[1] * weight
				accumB += seedSample[2] * weight
				weightSum += weight
			}

			for (let step = 0; step < length; step++) {
				const sx = backwardX[baseIdx + step]!
				const sy = backwardY[baseIdx + step]!
				const seedSample = sampleBilinear(seed, sx, sy)
				const weight = weights[step]!
				accumR += seedSample[0] * weight
				accumG += seedSample[1] * weight
				accumB += seedSample[2] * weight
				weightSum += weight
			}

			const outIdx = (y * width + x) * 4

			if (weightSum > 0) {
				output[outIdx] = accumR / weightSum
				output[outIdx + 1] = accumG / weightSum
				output[outIdx + 2] = accumB / weightSum
			} else {
				output[outIdx] = seedData[outIdx]!
				output[outIdx + 1] = seedData[outIdx + 1]!
				output[outIdx + 2] = seedData[outIdx + 2]!
			}

			output[outIdx + 3] = seedData[outIdx + 3]!
		}
	}

	return new ImageData(output, width, height)
}

export function applyLIC(
	seed: ImageData,
	field: ImageData,
	length: number,
	stepSize: number,
	uniformStep = false,
): ImageData {
	if (seed.width !== field.width || seed.height !== field.height) {
		throw new Error(
			`applyLIC: seed and field dimensions must match (seed=${String(seed.width)}x${String(seed.height)}, field=${String(field.width)}x${String(field.height)})`,
		)
	}

	const streamlines = computeStreamlines(field, length, stepSize, uniformStep)

	return applyLicWithStreamlines(seed, streamlines)
}
/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface LICProps {
	length?: number
	stepSize?: number
	uniformStep?: boolean
	map: ReactNode
	children: ReactNode
	version?: string
}

/**
 * Smears the children along a direction field, producing streamline-aligned
 * output — the look you'd use to visualize a vector field or to drive
 * field-following stylization. Pair with `Direction` passed via `map` to
 * derive the field from an image.
 *
 * Requires the `map` prop. Without one the effect throws.
 *
 * - `length` — Streamline length in steps per direction (forward and backward). Higher values produce longer smears. Default 20.
 * - `stepSize` — Step size in pixels per integration step. Default 1.
 * - `uniformStep` — Walk at a constant step length, ignoring the field's magnitude channel. Default false — step length scales with magnitude, which suits visualizing the field but can stall on smooth fields. Set true to follow a smooth field (e.g. a depth gradient) at full distance.
 * - `map` — Required. Vector field as JSX (typically a `Direction`-style encoding).
 * - `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.
 *
 * @param props
 * @category Effects
 */
export function LIC({
	length = 20,
	stepSize = 1.0,
	uniformStep = false,
	map,
	children,
	version,
}: LICProps) {
	const internal = `lic@1+l=${length}+t=${stepSize}+u=${uniformStep}`
	const composedVersion = version === undefined ? internal : `${internal}+${version}`

	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels === undefined) {
				throw new Error("LIC requires a map prop providing the vector field")
			}

			return applyLIC(target, mapPixels, length, stepSize, uniformStep)
		},
		[length, stepSize, uniformStep],
	)

	return (
		<RasterEffect effect={effect} map={map} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
