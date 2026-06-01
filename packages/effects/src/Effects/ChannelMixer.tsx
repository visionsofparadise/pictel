import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function applyChannelMix(pixels: ImageData, matrix: Array<Array<number>>): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)
	const [rowR, rowG, rowB] = matrix as [Array<number>, Array<number>, Array<number>]

	for (let px = 0; px < src.length; px += 4) {
		const red = src[px]!
		const green = src[px + 1]!
		const blue = src[px + 2]!

		output[px] = rowR[0]! * red + rowR[1]! * green + rowR[2]! * blue
		output[px + 1] = rowG[0]! * red + rowG[1]! * green + rowG[2]! * blue
		output[px + 2] = rowB[0]! * red + rowB[1]! * green + rowB[2]! * blue
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface ChannelMixerProps {
	matrix: Array<Array<number>>
	map?: ReactNode
	children: ReactNode
	version?: string
}

/**
 * Remaps RGB channels through a 3x3 mixing matrix. Each output channel is a
 * weighted sum of the input channels.
 *
 * - `matrix` — 3x3 array where `matrix[outChannel][inChannel]` is the weight. Stabilize with `useMemo`.
 * - `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.
 *
 * @param props
 * @category Effects
 */
export function ChannelMixer({ matrix, map, children, version }: ChannelMixerProps) {
	const internal = `channelMixer@1+x=${JSON.stringify(matrix)}`
	const composedVersion = version === undefined ? internal : `${internal}+${version}`

	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			const result = applyChannelMix(target, matrix)

			if (mapPixels !== undefined) {
				return mixBlend(target, result, mapPixels)
			}

			return result
		},
		[matrix],
	)

	return (
		<RasterEffect effect={effect} map={map} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
