import type { ReactNode } from "react"
import { useCallback, useEffect, useState } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { mixBlend } from "./utils/mix-blend"

export function parseCubeFile(content: string): { lut: Float32Array; size: number } {
	const lines = content.split("\n")
	let size = 0
	const values: Array<number> = []

	for (const raw of lines) {
		const line = raw.trim()

		if (line === "" || line.startsWith("#")) continue

		if (line.startsWith("TITLE")) continue

		if (line.startsWith("DOMAIN_MIN")) continue

		if (line.startsWith("DOMAIN_MAX")) continue

		if (line.startsWith("LUT_3D_SIZE")) {
			const sizeToken = line.split(/\s+/)[1]

			if (sizeToken) size = parseInt(sizeToken, 10)

			continue
		}

		const parts = line.split(/\s+/)

		if (parts.length >= 3) {
			values.push(parseFloat(parts[0] ?? "0"), parseFloat(parts[1] ?? "0"), parseFloat(parts[2] ?? "0"))
		}
	}

	if (size === 0) throw new Error("Missing LUT_3D_SIZE in .cube file")

	const expected = size * size * size * 3

	if (values.length !== expected) {
		throw new Error(`Expected ${expected} values but got ${values.length}`)
	}

	return { lut: new Float32Array(values), size }
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function applyLut(pixels: ImageData, lut: Float32Array, size: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)
	const scale = size - 1
	const sizeSq = size * size

	for (let px = 0; px < src.length; px += 4) {
		const rNorm = src[px]! / 255 * scale
		const gNorm = src[px + 1]! / 255 * scale
		const bNorm = src[px + 2]! / 255 * scale

		const r0 = Math.min(Math.floor(rNorm), scale - 1)
		const g0 = Math.min(Math.floor(gNorm), scale - 1)
		const b0 = Math.min(Math.floor(bNorm), scale - 1)

		const r1 = r0 + 1
		const g1 = g0 + 1
		const b1 = b0 + 1

		const rFrac = rNorm - r0
		const gFrac = gNorm - g0
		const bFrac = bNorm - b0

		const i000 = (b0 * sizeSq + g0 * size + r0) * 3
		const i100 = (b0 * sizeSq + g0 * size + r1) * 3
		const i010 = (b0 * sizeSq + g1 * size + r0) * 3
		const i110 = (b0 * sizeSq + g1 * size + r1) * 3
		const i001 = (b1 * sizeSq + g0 * size + r0) * 3
		const i101 = (b1 * sizeSq + g0 * size + r1) * 3
		const i011 = (b1 * sizeSq + g1 * size + r0) * 3
		const i111 = (b1 * sizeSq + g1 * size + r1) * 3

		// 24 scalar corner values
		const r000 = lut[i000]!
		const g000 = lut[i000 + 1]!
		const b000c = lut[i000 + 2]!
		const r100 = lut[i100]!
		const g100 = lut[i100 + 1]!
		const b100c = lut[i100 + 2]!
		const r010 = lut[i010]!
		const g010 = lut[i010 + 1]!
		const b010c = lut[i010 + 2]!
		const r110 = lut[i110]!
		const g110 = lut[i110 + 1]!
		const b110c = lut[i110 + 2]!
		const r001 = lut[i001]!
		const g001 = lut[i001 + 1]!
		const b001c = lut[i001 + 2]!
		const r101 = lut[i101]!
		const g101 = lut[i101 + 1]!
		const b101c = lut[i101 + 2]!
		const r011 = lut[i011]!
		const g011 = lut[i011 + 1]!
		const b011c = lut[i011 + 2]!
		const r111 = lut[i111]!
		const g111 = lut[i111 + 1]!
		const b111c = lut[i111 + 2]!

		// R channel trilinear (4 r-lerps + 2 g-lerps + 1 b-lerp)
		const redC00 = r000 + rFrac * (r100 - r000)
		const redC10 = r010 + rFrac * (r110 - r010)
		const redC01 = r001 + rFrac * (r101 - r001)
		const redC11 = r011 + rFrac * (r111 - r011)
		const redV0 = redC00 + gFrac * (redC10 - redC00)
		const redV1 = redC01 + gFrac * (redC11 - redC01)
		output[px] = (redV0 + bFrac * (redV1 - redV0)) * 255

		// G channel trilinear
		const greenC00 = g000 + rFrac * (g100 - g000)
		const greenC10 = g010 + rFrac * (g110 - g010)
		const greenC01 = g001 + rFrac * (g101 - g001)
		const greenC11 = g011 + rFrac * (g111 - g011)
		const greenV0 = greenC00 + gFrac * (greenC10 - greenC00)
		const greenV1 = greenC01 + gFrac * (greenC11 - greenC01)
		output[px + 1] = (greenV0 + bFrac * (greenV1 - greenV0)) * 255

		// B channel trilinear
		const blueC00 = b000c + rFrac * (b100c - b000c)
		const blueC10 = b010c + rFrac * (b110c - b010c)
		const blueC01 = b001c + rFrac * (b101c - b001c)
		const blueC11 = b011c + rFrac * (b111c - b011c)
		const blueV0 = blueC00 + gFrac * (blueC10 - blueC00)
		const blueV1 = blueC01 + gFrac * (blueC11 - blueC01)
		output[px + 2] = (blueV0 + bFrac * (blueV1 - blueV0)) * 255

		output[px + 3] = src[px + 3]!
	}

	return new ImageData(output, pixels.width, pixels.height)
}
/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface CubeLUTProps {
	src: string
	map?: ReactNode
	children: ReactNode
}

/**
 * Applies a .cube 3D LUT file for color grading. Fetches and parses the cube file, then
 * applies trilinear-interpolated color transformation.
 *
 * - `src` — URL to a .cube LUT file.
 *
 * @param props
 * @category Effects
 */
export function CubeLUT({ src, map, children }: CubeLUTProps) {
	const [lutData, setLutData] = useState<{ lut: Float32Array; size: number } | null>(null)

	useEffect(() => {
		let cancelled = false

		fetch(src)
			.then((response) => response.text())
			.then((text) => {
				if (!cancelled) setLutData(parseCubeFile(text))
			})
			.catch(() => {
				if (!cancelled) setLutData(null)
			})

		return () => {
			cancelled = true
		}
	}, [src])

	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			const result = lutData ? applyLut(target, lutData.lut, lutData.size) : target

			if (mapPixels !== undefined) {
				return mixBlend(target, result, mapPixels)
			}

			return result
		},
		[lutData],
	)

	return (
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
