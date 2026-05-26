import type { ReactNode } from "react"
import { useCallback, useEffect, useState } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { mixBlend } from "./utils/mix-blend"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

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

		const r0 = Math.min(Math.floor(rd), scale - 1)
		const r1 = r0 + 1
		const rFrac = rd - r0

		const g0 = Math.min(Math.floor(gn), scale - 1)
		const g1 = g0 + 1
		const gFrac = gn - g0

		const x0Base = b0 * size
		const x1Base = b1 * size

		const off000 = (g0 * lutWidth + x0Base + r0) * 4
		const off100 = (g0 * lutWidth + x0Base + r1) * 4
		const off010 = (g1 * lutWidth + x0Base + r0) * 4
		const off110 = (g1 * lutWidth + x0Base + r1) * 4
		const off001 = (g0 * lutWidth + x1Base + r0) * 4
		const off101 = (g0 * lutWidth + x1Base + r1) * 4
		const off011 = (g1 * lutWidth + x1Base + r0) * 4
		const off111 = (g1 * lutWidth + x1Base + r1) * 4

		// 24 scalar corner values
		const r000 = lutData[off000]!
		const g000 = lutData[off000 + 1]!
		const b000 = lutData[off000 + 2]!
		const r100 = lutData[off100]!
		const g100 = lutData[off100 + 1]!
		const b100 = lutData[off100 + 2]!
		const r010 = lutData[off010]!
		const g010 = lutData[off010 + 1]!
		const b010 = lutData[off010 + 2]!
		const r110 = lutData[off110]!
		const g110 = lutData[off110 + 1]!
		const b110 = lutData[off110 + 2]!
		const r001 = lutData[off001]!
		const g001 = lutData[off001 + 1]!
		const b001 = lutData[off001 + 2]!
		const r101 = lutData[off101]!
		const g101 = lutData[off101 + 1]!
		const b101 = lutData[off101 + 2]!
		const r011 = lutData[off011]!
		const g011 = lutData[off011 + 1]!
		const b011 = lutData[off011 + 2]!
		const r111 = lutData[off111]!
		const g111 = lutData[off111 + 1]!
		const b111 = lutData[off111 + 2]!

		// R channel trilinear
		const redC00 = r000 + rFrac * (r100 - r000)
		const redC10 = r010 + rFrac * (r110 - r010)
		const redC01 = r001 + rFrac * (r101 - r001)
		const redC11 = r011 + rFrac * (r111 - r011)
		const redV0 = redC00 + gFrac * (redC10 - redC00)
		const redV1 = redC01 + gFrac * (redC11 - redC01)
		output[px] = redV0 + bFrac * (redV1 - redV0)

		// G channel trilinear
		const greenC00 = g000 + rFrac * (g100 - g000)
		const greenC10 = g010 + rFrac * (g110 - g010)
		const greenC01 = g001 + rFrac * (g101 - g001)
		const greenC11 = g011 + rFrac * (g111 - g011)
		const greenV0 = greenC00 + gFrac * (greenC10 - greenC00)
		const greenV1 = greenC01 + gFrac * (greenC11 - greenC01)
		output[px + 1] = greenV0 + bFrac * (greenV1 - greenV0)

		// B channel trilinear
		const blueC00 = b000 + rFrac * (b100 - b000)
		const blueC10 = b010 + rFrac * (b110 - b010)
		const blueC01 = b001 + rFrac * (b101 - b001)
		const blueC11 = b011 + rFrac * (b111 - b011)
		const blueV0 = blueC00 + gFrac * (blueC10 - blueC00)
		const blueV1 = blueC01 + gFrac * (blueC11 - blueC01)
		output[px + 2] = blueV0 + bFrac * (blueV1 - blueV0)

		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}
/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface ImageLUTProps {
	src: string
	size: number
	map?: ReactNode
	children: ReactNode
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
export function ImageLUT({ src, size, map, children }: ImageLUTProps) {
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

	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			const result = lutImage ? applyImageLut(target, lutImage, size) : target

			if (mapPixels !== undefined) {
				return mixBlend(target, result, mapPixels)
			}

			return result
		},
		[lutImage, size],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
