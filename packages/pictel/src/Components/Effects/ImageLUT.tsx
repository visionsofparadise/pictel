import type { ComponentProps } from "react"
import { useCallback, useEffect, useState } from "react"
import { RasterEffect } from "../Pipeline/RasterEffect"
import { lerp } from "./utils/lerp"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
function sampleLut(lutData: Uint8ClampedArray, lutWidth: number, x: number, y: number): [number, number, number] {
	const offset = (y * lutWidth + x) * 4

	return [lutData[offset]!, lutData[offset + 1]!, lutData[offset + 2]!]
}

export function applyImageLut(pixels: ImageData, lutImage: ImageData, size: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)
	const lutData = lutImage.data
	const lutWidth = lutImage.width
	const scale = size - 1

	for (let px = 0; px < src.length; px += 4) {
		const rd = src[px]! / 255 * scale
		const gn = src[px + 1]! / 255 * scale
		const bl = src[px + 2]! / 255 * scale

		const b0 = Math.min(Math.floor(bl), scale - 1)
		const b1 = b0 + 1
		const bFrac = bl - b0

		const rCoord = rd
		const gCoord = gn

		const r0 = Math.min(Math.floor(rCoord), scale - 1)
		const r1 = r0 + 1
		const rFrac = rCoord - r0

		const g0 = Math.min(Math.floor(gCoord), scale - 1)
		const g1 = g0 + 1
		const gFrac = gCoord - g0

		const x0Base = b0 * size
		const s000 = sampleLut(lutData, lutWidth, x0Base + r0, g0)
		const s100 = sampleLut(lutData, lutWidth, x0Base + r1, g0)
		const s010 = sampleLut(lutData, lutWidth, x0Base + r0, g1)
		const s110 = sampleLut(lutData, lutWidth, x0Base + r1, g1)

		const x1Base = b1 * size
		const s001 = sampleLut(lutData, lutWidth, x1Base + r0, g0)
		const s101 = sampleLut(lutData, lutWidth, x1Base + r1, g0)
		const s011 = sampleLut(lutData, lutWidth, x1Base + r0, g1)
		const s111 = sampleLut(lutData, lutWidth, x1Base + r1, g1)

		for (let ch = 0; ch < 3; ch++) {
			const c00 = lerp(s000[ch]!, s100[ch]!, rFrac)
			const c10 = lerp(s010[ch]!, s110[ch]!, rFrac)
			const val0 = lerp(c00, c10, gFrac)

			const c01 = lerp(s001[ch]!, s101[ch]!, rFrac)
			const c11 = lerp(s011[ch]!, s111[ch]!, rFrac)
			const val1 = lerp(c01, c11, gFrac)

			output[px + ch] = lerp(val0, val1, bFrac)
		}

		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}
/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface ImageLUTProps extends ComponentProps<"div"> {
	/** URL to the LUT image. */
	src: string
	/** Grid dimension of the LUT (e.g., 16 for a 16x16x16 LUT). */
	size: number
	backdrop?: boolean
	flatten?: boolean
}

/**
 * Applies a 3D LUT from an image file (PNG strip of horizontal slices) for color grading.
 *
 * - `src` — URL to the LUT image.
 * - `size` — Grid dimension of the LUT (e.g., 16 for a 16x16x16 LUT).
 *
 * @param props
 * @category Effects
 */
export function ImageLUT({ src, size, backdrop, flatten, ...rest }: ImageLUTProps) {
	const [lutImage, setLutImage] = useState<ImageData | null>(null)

	useEffect(() => {
		let cancelled = false

		const img = new Image()
		img.crossOrigin = "anonymous"
		img.onload = () => {
			if (cancelled) return

			const canvas = document.createElement("canvas")
			canvas.width = img.width
			canvas.height = img.height
			const context = canvas.getContext("2d")

			if (!context) return

			context.drawImage(img, 0, 0)
			setLutImage(context.getImageData(0, 0, img.width, img.height))
		}
		img.onerror = () => {
			if (!cancelled) setLutImage(null)
		}
		img.src = src

		return () => {
			cancelled = true
		}
	}, [src])

	const effect = useCallback(
		(pixels: ImageData) => (lutImage ? applyImageLut(pixels, lutImage, size) : pixels),
		[lutImage, size],
	)

	return (
		<RasterEffect effect={effect} backdrop={backdrop} flatten={flatten} {...rest} />
	)
}
