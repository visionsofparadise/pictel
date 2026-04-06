import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect } from "../RasterEffect"

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

interface ChannelMixerProps extends ComponentPropsWithoutRef<"div"> {
	/**
	 * 3x3 channel mixing matrix: `matrix[outChannel][inChannel]`.
	 *
	 * Consumer must stabilize the matrix reference with `useMemo` since a new
	 * array literal on every render will invalidate the effect callback.
	 */
	matrix: Array<Array<number>>
	flatten?: boolean
	children?: ReactNode
}

export function ChannelMixer({ matrix, flatten, children, ...rest }: ChannelMixerProps) {
	const effect = useCallback(
		(pixels: ImageData) => applyChannelMix(pixels, matrix),
		[matrix],
	)

	return (
		<RasterEffect effect={effect} flatten={flatten} {...rest}>
			{children}
		</RasterEffect>
	)
}
