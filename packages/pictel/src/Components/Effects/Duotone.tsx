import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect } from "../RasterEffect"
import { luminance } from "./utils/luminance"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function applyDuotone(
	pixels: ImageData,
	dark: [number, number, number],
	light: [number, number, number],
): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const lum = luminance(src[px]!, src[px + 1]!, src[px + 2]!)
		const ratio = lum / 255

		output[px] = dark[0] + ratio * (light[0] - dark[0])
		output[px + 1] = dark[1] + ratio * (light[1] - dark[1])
		output[px + 2] = dark[2] + ratio * (light[2] - dark[2])
		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface DuotoneProps extends ComponentPropsWithoutRef<"div"> {
	dark: [number, number, number]
	light: [number, number, number]
	flatten?: boolean
	children?: ReactNode
}

export function Duotone({ dark, light, flatten, children, ...rest }: DuotoneProps) {
	const effect = useCallback(
		(pixels: ImageData) => applyDuotone(pixels, dark, light),
		[dark, light],
	)

	return (
		<RasterEffect effect={effect} flatten={flatten} {...rest}>
			{children}
		</RasterEffect>
	)
}
