import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { mixBlend } from "./utils/mix-blend"
import { mulberry32 } from "./utils/mulberry32"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function applyGrain(pixels: ImageData, intensity: number, seed: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)
	const rng = mulberry32(seed)

	for (let px = 0; px < src.length; px += 4) {
		const noise = (rng() * 2 - 1) * intensity
		const red = src[px]!
		const green = src[px + 1]!
		const blue = src[px + 2]!

		output[px] = Math.min(255, Math.max(0, Math.round(red + noise)))
		output[px + 1] = Math.min(255, Math.max(0, Math.round(green + noise)))
		output[px + 2] = Math.min(255, Math.max(0, Math.round(blue + noise)))
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}
/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface GrainProps {
	intensity: number
	seed: number
	map?: ReactNode
	children: ReactNode
	version?: string
}

/**
 * Adds deterministic monochromatic film grain noise to the image.
 *
 * - `intensity` — Maximum noise amplitude in pixel values (0-255 range).
 * - `seed` — Random seed for reproducible grain patterns.
 * - `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.
 *
 * @param props
 * @category Effects
 */
export function Grain({ intensity, seed, map, children, version }: GrainProps) {
	const internal = `grain@1+i=${intensity}+s=${seed}`
	const composedVersion = version === undefined ? internal : `${internal}+${version}`

	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			const result = applyGrain(target, intensity, seed)

			if (mapPixels !== undefined) {
				return mixBlend(target, result, mapPixels)
			}

			return result
		},
		[intensity, seed],
	)

	return (
		<RasterEffect effect={effect} map={map} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
