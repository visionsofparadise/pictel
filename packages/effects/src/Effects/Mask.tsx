import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { luminance } from "./utils/luminance"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export type MaskSource = "alpha" | "luminance"

export function applyMask(pixels: ImageData, mask: ImageData, source: MaskSource): ImageData {
	if (pixels.width !== mask.width || pixels.height !== mask.height) {
		throw new Error(
			`applyMask: pixels and mask dimensions must match (pixels=${String(pixels.width)}x${String(pixels.height)}, mask=${String(mask.width)}x${String(mask.height)})`,
		)
	}

	const src = pixels.data
	const maskData = mask.data
	const output = new Uint8ClampedArray(src.length)

	for (let px = 0; px < src.length; px += 4) {
		const maskValue = source === "luminance"
			? luminance(maskData[px]!, maskData[px + 1]!, maskData[px + 2]!) / 255
			: maskData[px + 3]! / 255

		output[px] = src[px]!
		output[px + 1] = src[px + 1]!
		output[px + 2] = src[px + 2]!
		output[px + 3] = src[px + 3]! * maskValue
	}

	return new ImageData(output, pixels.width, pixels.height)
}

/* eslint-enable @typescript-eslint/no-non-null-assertion */

interface MaskProps {
	map: ReactNode
	source?: MaskSource
	children: ReactNode
	version?: string
}

/**
 * Clips its children to a mask supplied via the `map` prop. The mask's alpha
 * channel — or its luminance, with `source="luminance"` — is multiplied into
 * the children's alpha; RGB is left untouched.
 *
 * Use it to confine a result to a shape. Blends and many effects fill
 * transparent regions — W3C compositing makes an opaque overlay opaque
 * everywhere it covers — and `Mask` restores the intended silhouette by
 * clipping the result back to a known shape.
 *
 * Requires a `map`; without one the effect throws.
 *
 * - `source` — `"alpha"` (default) reads the map's alpha channel; `"luminance"` reads its brightness (white keeps, black drops).
 * - `version` — Optional cache-bust handle. Composed with this effect's internal version; bumping invalidates the cached output for this subtree.
 *
 * @param props
 * @category Effects
 */
export function Mask({ map, source = "alpha", children, version }: MaskProps) {
	const internal = `mask@1+s=${source}`
	const composedVersion = version === undefined ? internal : `${internal}+${version}`

	const effect = useCallback<RasterEffectCallback>(
		(target, _apply, mapPixels) => {
			if (mapPixels === undefined) {
				throw new Error("Mask requires a map prop providing the mask")
			}

			return applyMask(target, mapPixels, source)
		},
		[source],
	)

	return (
		<RasterEffect effect={effect} map={map} version={composedVersion}>
			{children}
		</RasterEffect>
	)
}
