import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function applyDuotone(
	pixels: ImageData,
	dark: [number, number, number],
	light: [number, number, number],
): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const lum = 0.299 * src[px]! + 0.587 * src[px + 1]! + 0.114 * src[px + 2]!
		const ratio = lum / 255

		output[px] = dark[0] + ratio * (light[0] - dark[0])
		output[px + 1] = dark[1] + ratio * (light[1] - dark[1])
		output[px + 2] = dark[2] + ratio * (light[2] - dark[2])
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface DuotoneProps {
	dark: [number, number, number]
	light: [number, number, number]
	map?: ReactNode
	children: ReactNode
}

/**
 * Maps pixel luminance to a two-color gradient. Shadows map to `dark`, highlights to `light`.
 *
 * - `dark` — RGB triple [r, g, b] (0-255) for shadow tones.
 * - `light` — RGB triple [r, g, b] (0-255) for highlight tones.
 *
 * @param props
 * @category Effects
 */
export function Duotone({ dark, light, map, children }: DuotoneProps) {
	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			const result = applyDuotone(target, dark, light)

			if (mapPixels !== undefined) {
				return mixBlend(target, result, mapPixels)
			}

			return result
		},
		[dark, light],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
