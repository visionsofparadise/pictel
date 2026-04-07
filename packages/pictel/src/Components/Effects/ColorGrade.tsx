import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { useCallback } from "react"
import { TargetEffect } from "../TargetEffect"
import { luminance } from "./utils/luminance"

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

interface ColorGradeProps extends ColorGradeAdjustments, ComponentPropsWithoutRef<"div"> {
	flatten?: boolean
	children?: ReactNode
}

export function ColorGrade({
	brightness,
	contrast,
	saturation,
	temperature,
	tint,
	flatten,
	children,
	...rest
}: ColorGradeProps) {
	const effect = useCallback(
		(pixels: ImageData) =>
			applyColorGrade(pixels, { brightness, contrast, saturation, temperature, tint }),
		[brightness, contrast, saturation, temperature, tint],
	)

	return (
		<TargetEffect effect={effect} flatten={flatten} {...rest}>
			{children}
		</TargetEffect>
	)
}
