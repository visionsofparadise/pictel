import type { ReactNode } from "react"
import { useCallback, useEffect, useState } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { lerp } from "./utils/lerp"
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

function lutIndex(size: number, red: number, green: number, blue: number): number {
	return (blue * size * size + green * size + red) * 3
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function applyLut(pixels: ImageData, lut: Float32Array, size: number): ImageData {
	const src = pixels.data
	const output = new Uint8ClampedArray(src.length)
	const scale = size - 1

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

		const i000 = lutIndex(size, r0, g0, b0)
		const i100 = lutIndex(size, r1, g0, b0)
		const i010 = lutIndex(size, r0, g1, b0)
		const i110 = lutIndex(size, r1, g1, b0)
		const i001 = lutIndex(size, r0, g0, b1)
		const i101 = lutIndex(size, r1, g0, b1)
		const i011 = lutIndex(size, r0, g1, b1)
		const i111 = lutIndex(size, r1, g1, b1)

		for (let ch = 0; ch < 3; ch++) {
			const c00 = lerp(lut[i000 + ch]!, lut[i100 + ch]!, rFrac)
			const c10 = lerp(lut[i010 + ch]!, lut[i110 + ch]!, rFrac)
			const c01 = lerp(lut[i001 + ch]!, lut[i101 + ch]!, rFrac)
			const c11 = lerp(lut[i011 + ch]!, lut[i111 + ch]!, rFrac)

			const c0 = lerp(c00, c10, gFrac)
			const c1 = lerp(c01, c11, gFrac)

			output[px + ch] = lerp(c0, c1, bFrac) * 255
		}

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
