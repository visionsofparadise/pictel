import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect } from "../Pipeline/RasterEffect"
import { luminance } from "./utils/luminance"

export interface ColorGradeAdjustments {
	/** Brightness multiplier. Default 1. */
	brightness?: number
	/** Contrast multiplier. Default 1. */
	contrast?: number
	/** Saturation multiplier. Default 1. */
	saturation?: number
	/** Warm/cool shift. Positive warms (adds red, removes blue), negative cools. */
	temperature?: number
	/** Green/magenta shift. Positive adds magenta, negative adds green. */
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

		// Brightness
		red *= brightness
		green *= brightness
		blue *= brightness

		// Contrast
		red = ((red / 255 - 0.5) * contrast + 0.5) * 255
		green = ((green / 255 - 0.5) * contrast + 0.5) * 255
		blue = ((blue / 255 - 0.5) * contrast + 0.5) * 255

		// Saturation
		const lum = luminance(red, green, blue)
		red = lum + (red - lum) * saturation
		green = lum + (green - lum) * saturation
		blue = lum + (blue - lum) * saturation

		// Temperature
		red += temperature * 30
		blue -= temperature * 30

		// Tint
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
	backdrop?: boolean
	flatten?: boolean
	children: ReactNode
}

/**
 * Combined color grading with brightness, contrast, saturation, temperature, and tint controls.
 *
 * - `brightness` — Brightness multiplier. Default 1.
 * - `contrast` — Contrast multiplier. Default 1.
 * - `saturation` — Saturation multiplier. Default 1.
 * - `temperature` — Warm/cool shift. Positive warms (adds red, removes blue), negative cools.
 * - `tint` — Green/magenta shift. Positive adds magenta, negative adds green.
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
	backdrop,
	flatten,
	children,
}: ColorGradeProps) {
	const effect = useCallback(
		(pixels: ImageData) =>
			applyColorGrade(pixels, { brightness, contrast, saturation, temperature, tint }),
		[brightness, contrast, saturation, temperature, tint],
	)

	return (
		<RasterEffect effect={effect} backdrop={backdrop} flatten={flatten}>
			{children}
		</RasterEffect>
	)
}
