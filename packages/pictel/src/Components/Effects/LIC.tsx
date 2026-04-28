import { useCallback, type ReactNode } from "react"
import { RasterEffect } from "../Pipeline/RasterEffect"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * Bilinear sample of an ImageData buffer at a fractional position. Coordinates
 * are clamped to the image bounds (extension by clamping). Returns an RGBA
 * tuple with each channel in [0, 255].
 */
function sampleBilinear(image: ImageData, x: number, y: number): [number, number, number, number] {
	const { width, height, data } = image

	const cx = x < 0 ? 0 : x > width - 1 ? width - 1 : x
	const cy = y < 0 ? 0 : y > height - 1 ? height - 1 : y

	const x0 = Math.floor(cx)
	const y0 = Math.floor(cy)
	const x1 = x0 + 1 > width - 1 ? width - 1 : x0 + 1
	const y1 = y0 + 1 > height - 1 ? height - 1 : y0 + 1

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
 * Line Integral Convolution: integrate `seed` along the vector field encoded
 * in `field`, producing streamline-aligned output. The field is decoded as
 * `cos = R/127.5 - 1`, `sin = G/127.5 - 1`, `magnitude = B/255` — the
 * Direction-style cos/sin/magnitude pack.
 *
 * For each output pixel, a forward and a backward Euler integration of
 * `length` steps is performed, sampling the seed bilinearly at each step and
 * accumulating with hat-function weighting `w = 1 - i / length`. Per-pixel
 * step length scales with magnitude as `stepSize * (0.25 + 0.75 * magnitude)`
 * — the floor at 25% prevents stagnation in zero-magnitude regions while
 * full-magnitude regions step the full distance.
 *
 * Out-of-bounds samples are clamped to the edge pixel (extension by clamping).
 *
 * Reference: Cabral & Leedom 1993, "Imaging Vector Fields Using Line Integral
 * Convolution".
 */
export function applyLIC(seed: ImageData, field: ImageData, length: number, stepSize: number): ImageData {
	if (seed.width !== field.width || seed.height !== field.height) {
		throw new Error(
			`applyLIC: seed and field dimensions must match (seed=${String(seed.width)}x${String(seed.height)}, field=${String(field.width)}x${String(field.height)})`,
		)
	}

	const { width, height, data: seedData } = seed
	const output = new Uint8ClampedArray(seedData.length)

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let accumR = 0
			let accumG = 0
			let accumB = 0
			let weightSum = 0

			// Forward integration
			let fx = x
			let fy = y

			for (let step = 0; step < length; step++) {
				const fieldSample = sampleBilinear(field, fx, fy)
				const cos = fieldSample[0] / 127.5 - 1
				const sin = fieldSample[1] / 127.5 - 1
				const magnitude = fieldSample[2] / 255
				const stepLength = stepSize * (0.25 + 0.75 * magnitude)

				fx += cos * stepLength
				fy += sin * stepLength

				const seedSample = sampleBilinear(seed, fx, fy)
				const weight = 1 - step / length
				accumR += seedSample[0] * weight
				accumG += seedSample[1] * weight
				accumB += seedSample[2] * weight
				weightSum += weight
			}

			// Backward integration
			let bx = x
			let by = y

			for (let step = 0; step < length; step++) {
				const fieldSample = sampleBilinear(field, bx, by)
				const cos = fieldSample[0] / 127.5 - 1
				const sin = fieldSample[1] / 127.5 - 1
				const magnitude = fieldSample[2] / 255
				const stepLength = stepSize * (0.25 + 0.75 * magnitude)

				bx -= cos * stepLength
				by -= sin * stepLength

				const seedSample = sampleBilinear(seed, bx, by)
				const weight = 1 - step / length
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
				const seedIdx = outIdx
				output[outIdx] = seedData[seedIdx]!
				output[outIdx + 1] = seedData[seedIdx + 1]!
				output[outIdx + 2] = seedData[seedIdx + 2]!
			}

			output[outIdx + 3] = seedData[outIdx + 3]!
		}
	}

	return new ImageData(output, width, height)
}
/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface LICProps {
	/** Number of integration steps in each direction (forward and backward). Default 20. */
	length?: number
	/** Base step size in pixels per integration step. Default 1.0. */
	stepSize?: number
	mode?: "parameter" | "mix"
	backdrop?: boolean
	children: ReactNode
}

/**
 * Line Integral Convolution. Smears the seed children along a vector field
 * supplied by a `<Map>` child, producing streamline-aligned output. The map
 * is expected to be a Direction-style three-channel encoding: red = cos(θ)
 * packed into [0,255], green = sin(θ) packed into [0,255], blue = magnitude
 * in [0,255].
 *
 * Requires a `<Map>` child providing the vector field. Without a map the
 * effect throws — LIC has no meaning without a field.
 *
 * Reference: Cabral & Leedom 1993, "Imaging Vector Fields Using Line Integral
 * Convolution".
 *
 * - `length` — Number of integration steps in each direction (forward and backward). Default 20.
 * - `stepSize` — Base step size in pixels per integration step. Default 1.0.
 *
 * @param props
 * @category Effects
 */
export function LIC({
	length = 20,
	stepSize = 1.0,
	mode,
	backdrop,
	children,
}: LICProps) {
	const effect = useCallback(
		(_pixels: ImageData): ImageData => {
			throw new Error("LIC requires a <Map> child providing the vector field")
		},
		[],
	)

	const mappedEffect = useCallback(
		(pixels: ImageData, map: ImageData) => applyLIC(pixels, map, length, stepSize),
		[length, stepSize],
	)

	return (
		<RasterEffect effect={effect} mappedEffect={mappedEffect} mode={mode ?? "parameter"} backdrop={backdrop}>
			{children}
		</RasterEffect>
	)
}
