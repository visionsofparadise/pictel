/* eslint-disable react-hooks/preserve-manual-memoization -- The `stops` array
 * may be passed as an inline JSX literal (fresh identity each render). We use
 * `stopsKey` (a serialized content hash) in deps so `effect` stays referentially
 * stable. React Compiler infers `stops` as the dep and flags this; the
 * substitution is intentional. */
import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import type { GradientStop } from "../Generative/LinearGradient"
import { parseColor } from "./utils/parse-color"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function buildGradientLut(stops: Array<GradientStop>): Uint8ClampedArray {
	const lut = new Uint8ClampedArray(256 * 4)

	const sorted = [...stops].sort((first, second) => first.position - second.position)
	const colors = sorted.map((stop) => parseColor(stop.color))

	const last = sorted.length - 1

	for (let entry = 0; entry < 256; entry += 1) {
		const position = entry / 255

		let upper = 0

		while (upper < sorted.length && sorted[upper]!.position < position) upper += 1

		const out = entry * 4

		if (upper === 0) {
			lut[out] = colors[0]!.r
			lut[out + 1] = colors[0]!.g
			lut[out + 2] = colors[0]!.b
			lut[out + 3] = colors[0]!.a
			continue
		}

		if (upper > last) {
			lut[out] = colors[last]!.r
			lut[out + 1] = colors[last]!.g
			lut[out + 2] = colors[last]!.b
			lut[out + 3] = colors[last]!.a
			continue
		}

		const lo = sorted[upper - 1]!
		const hi = sorted[upper]!
		const span = hi.position - lo.position
		const ratio = span === 0 ? 0 : (position - lo.position) / span

		const loColor = colors[upper - 1]!
		const hiColor = colors[upper]!

		lut[out] = loColor.r + ratio * (hiColor.r - loColor.r)
		lut[out + 1] = loColor.g + ratio * (hiColor.g - loColor.g)
		lut[out + 2] = loColor.b + ratio * (hiColor.b - loColor.b)
		lut[out + 3] = loColor.a + ratio * (hiColor.a - loColor.a)
	}

	return lut
}

export function applyGradientMap(pixels: ImageData, lut: Uint8ClampedArray): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const lum = 0.299 * src[px]! + 0.587 * src[px + 1]! + 0.114 * src[px + 2]!
		const index = Math.round(lum) * 4

		output[px] = lut[index]!
		output[px + 1] = lut[index + 1]!
		output[px + 2] = lut[index + 2]!
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface GradientMapProps {
	stops: Array<GradientStop>
	map?: ReactNode
	children: ReactNode
	version?: string
}

/**
 * Maps pixel luminance through a multi-stop color ramp. Shadows take the first stop's
 * color, highlights the last, with continuous interpolation across the band between stops.
 *
 * A generalization of `Duotone` to N color stops — the same `{ color, position }` stop
 * model used by the gradient generatives. Luminance (BT.601) keys a 256-entry ramp built
 * once from `stops`.
 *
 * - `stops` — Array of color stops with `color` (any CSS color the library parses) and
 *   `position` (0-1). Sorted by position; luminance below the first / above the last stop
 *   clamps to that stop's color.
 * - `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.
 *
 * @param props
 * @category Effects
 */
export function GradientMap({ stops, map, children, version }: GradientMapProps) {
	const stopsKey = stops.map((stop) => `${stop.color}@${String(stop.position)}`).join("|")

	const internal = `gradientMap@1+s=${stopsKey}`
	const composedVersion = version === undefined ? internal : `${internal}+${version}`

	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			const lut = buildGradientLut(stops)
			const result = applyGradientMap(target, lut)

			if (mapPixels !== undefined) {
				return mixBlend(target, result, mapPixels)
			}

			return result
		},
		[stopsKey],
	)

	return (
		<RasterEffect effect={effect} map={map} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
