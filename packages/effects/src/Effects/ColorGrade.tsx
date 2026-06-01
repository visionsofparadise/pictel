import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { luminance } from "./utils/luminance"
import { mixBlend } from "./utils/mix-blend"

export interface ColorGradeAdjustments {
	brightness?: number
	contrast?: number
	saturation?: number
	temperature?: number
	tint?: number
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function applyColorGrade(pixels: ImageData, adjustments: ColorGradeAdjustments): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)
	const { brightness = 1, contrast = 1, saturation = 1, temperature = 0, tint = 0 } = adjustments

	for (let px = 0; px < src.length; px += 4) {
		let red = src[px]!
		let green = src[px + 1]!
		let blue = src[px + 2]!

		red *= brightness
		green *= brightness
		blue *= brightness

		red = ((red / 255 - 0.5) * contrast + 0.5) * 255
		green = ((green / 255 - 0.5) * contrast + 0.5) * 255
		blue = ((blue / 255 - 0.5) * contrast + 0.5) * 255

		const lum = luminance(red, green, blue)
		red = lum + (red - lum) * saturation
		green = lum + (green - lum) * saturation
		blue = lum + (blue - lum) * saturation

		red += temperature * 30
		blue -= temperature * 30

		red += tint * 15
		green -= tint * 30

		output[px] = red
		output[px + 1] = green
		output[px + 2] = blue
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface ColorGradeProps extends ColorGradeAdjustments {
	map?: ReactNode
	children: ReactNode
	version?: string
}

/**
 * Combined color grading with brightness, contrast, saturation, temperature, and tint controls.
 *
 * - `brightness` — Brightness multiplier. Default 1.
 * - `contrast` — Contrast multiplier. Default 1.
 * - `saturation` — Saturation multiplier. Default 1.
 * - `temperature` — Warm/cool shift. Positive warms (adds red, removes blue), negative cools.
 * - `tint` — Green/magenta shift. Positive adds magenta, negative adds green.
 * - `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.
 *
 * @param props
 * @category Effects
 */
export function ColorGrade({
	brightness,
	contrast,
	saturation,
	temperature,
	tint,
	map,
	children,
	version,
}: ColorGradeProps) {
	const internal = `colorGrade@1+b=${brightness}+c=${contrast}+s=${saturation}+t=${temperature}+n=${tint}`
	const composedVersion = version === undefined ? internal : `${internal}+${version}`

	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			const result = applyColorGrade(target, { brightness, contrast, saturation, temperature, tint })

			if (mapPixels !== undefined) {
				return mixBlend(target, result, mapPixels)
			}

			return result
		},
		[brightness, contrast, saturation, temperature, tint],
	)

	return (
		<RasterEffect effect={effect} map={map} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
