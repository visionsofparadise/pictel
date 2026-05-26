import type { ReactNode } from "react"
import { useCallback } from "react"
import { hslToRgb, rgbToHsl } from "../BlendModes/utils/hsl"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { luminance } from "./utils/luminance"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applyHueRotate(pixels: ImageData, angle: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const [hue, sat, li] = rgbToHsl(src[px]!, src[px + 1]!, src[px + 2]!)
		const [red, green, blue] = hslToRgb(hue + angle, sat, li)

		output[px] = red
		output[px + 1] = green
		output[px + 2] = blue
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

export function applyMappedHueRotate(pixels: ImageData, map: ImageData, angle: number): ImageData {
	const src = pixels.data
	const mapData = map.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const mapLum = luminance(mapData[px]!, mapData[px + 1]!, mapData[px + 2]!) / 255
		const effective = mapLum * angle

		const [hue, sat, li] = rgbToHsl(src[px]!, src[px + 1]!, src[px + 2]!)
		const [red, green, blue] = hslToRgb(hue + effective, sat, li)

		output[px] = red
		output[px + 1] = green
		output[px + 2] = blue
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface HueRotateProps {
	angle: number
	mode?: "parameter" | "mix"
	map?: ReactNode
	children: ReactNode
}

/**
 * Rotates the hue of each pixel in HSL color space.
 *
 * - `angle` — Hue rotation in degrees. 180 inverts all colors; 360 returns to original.
 *
 * @param props
 * @category Effects
 */
export function HueRotate({ angle, mode = "mix", map, children }: HueRotateProps) {
	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				if (mode === "parameter") {
					return applyMappedHueRotate(target, mapPixels, angle)
				}

				const result = applyHueRotate(target, angle)

				return mixBlend(target, result, mapPixels)
			}

			return applyHueRotate(target, angle)
		},
		[angle, mode],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
