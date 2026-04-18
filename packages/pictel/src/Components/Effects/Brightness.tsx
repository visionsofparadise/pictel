import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect } from "../Pipeline/RasterEffect"
import { lerp } from "./utils/lerp"
import { luminance } from "./utils/luminance"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applyBrightness(pixels: ImageData, amount: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		output[px] = Math.min(255, Math.max(0, src[px]! * amount))
		output[px + 1] = Math.min(255, Math.max(0, src[px + 1]! * amount))
		output[px + 2] = Math.min(255, Math.max(0, src[px + 2]! * amount))
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
	/** Brightness multiplier. 1 is unchanged, 0 is black, greater than 1 brightens. */
	amount?: number
	mode?: "parameter" | "mix"
	backdrop?: boolean
	children: ReactNode
}

/**
 * Adjusts pixel brightness by multiplying RGB channels.
 *
 * - `amount` — Brightness multiplier. 1 is unchanged, 0 is black, greater than 1 brightens.
 *
 * @param props
 * @category Effects
 */
export function Brightness({ amount = 1, mode = "mix", backdrop, children }: BrightnessProps) {
	const effect = useCallback(
		(pixels: ImageData) => applyBrightness(pixels, amount),
		[amount],
	)

	const mappedEffect = useCallback(
		(pixels: ImageData, map: ImageData) => applyMappedBrightness(pixels, map, amount),
		[amount],
	)

	return (
		<RasterEffect effect={effect} mappedEffect={mappedEffect} mode={mode} backdrop={backdrop}>
			{children}
		</RasterEffect>
	)
}
