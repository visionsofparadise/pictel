import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { lerp } from "./utils/lerp"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export function applySepia(pixels: ImageData, amount: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const red = src[px]!
		const green = src[px + 1]!
		const blue = src[px + 2]!

		const sepiaR = Math.min(255, 0.393 * red + 0.769 * green + 0.189 * blue)
		const sepiaG = Math.min(255, 0.349 * red + 0.686 * green + 0.168 * blue)
		const sepiaB = Math.min(255, 0.272 * red + 0.534 * green + 0.131 * blue)

		output[px] = lerp(red, sepiaR, amount)
		output[px + 1] = lerp(green, sepiaG, amount)
		output[px + 2] = lerp(blue, sepiaB, amount)
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface SepiaProps {
	amount?: number
	map?: ReactNode
	children: ReactNode
	version?: string
}

/**
 * Applies a warm sepia tone effect.
 *
 * - `amount` — Sepia intensity. 0 is unchanged, 1 is fully sepia. Default 1.
 * - `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.
 *
 * @param props
 * @category Effects
 */
export function Sepia({ amount = 1, map, children, version }: SepiaProps) {
	const internal = `sepia@1+a=${amount}`
	const composedVersion = version === undefined ? internal : `${internal}+${version}`

	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			const result = applySepia(target, amount)

			if (mapPixels !== undefined) {
				return mixBlend(target, result, mapPixels)
			}

			return result
		},
		[amount],
	)

	return (
		<RasterEffect effect={effect} map={map} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
