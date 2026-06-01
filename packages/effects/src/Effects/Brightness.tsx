import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { lerp } from "./utils/lerp"
import { luminance } from "./utils/luminance"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applyBrightness(pixels: ImageData, amount: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	const lut = new Uint8ClampedArray(256)

	for (let index = 0; index < 256; index++) {
		lut[index] = index * amount
	}

	for (let px = 0; px < src.length; px += 4) {
		output[px] = lut[src[px]!]!
		output[px + 1] = lut[src[px + 1]!]!
		output[px + 2] = lut[src[px + 2]!]!
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

export function applyMappedBrightness(pixels: ImageData, map: ImageData, amount: number): ImageData {
	const src = pixels.data
	const mapData = map.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const mapLum = luminance(mapData[px]!, mapData[px + 1]!, mapData[px + 2]!) / 255
		const effective = lerp(1, amount, mapLum)

		output[px] = Math.min(255, Math.max(0, src[px]! * effective))
		output[px + 1] = Math.min(255, Math.max(0, src[px + 1]! * effective))
		output[px + 2] = Math.min(255, Math.max(0, src[px + 2]! * effective))
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface BrightnessProps {
	amount?: number
	mode?: "parameter" | "mix"
	map?: ReactNode
	children: ReactNode
	version?: string
}

/**
 * Adjusts pixel brightness by multiplying RGB channels.
 *
 * - `amount` — Brightness multiplier. 1 is unchanged, 0 is black, greater than 1 brightens.
 * - `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.
 *
 * @param props
 * @category Effects
 */
export function Brightness({ amount = 1, mode = "mix", map, children, version }: BrightnessProps) {
	const internal = `brightness@1+a=${amount}+m=${mode}`
	const composedVersion = version === undefined ? internal : `${internal}+${version}`

	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels !== undefined) {
				if (mode === "parameter") {
					return applyMappedBrightness(target, mapPixels, amount)
				}

				const result = applyBrightness(target, amount)

				return mixBlend(target, result, mapPixels)
			}

			return applyBrightness(target, amount)
		},
		[amount, mode],
	)

	return (
		<RasterEffect effect={effect} map={map} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
