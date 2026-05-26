import type { ReactNode } from "react"
import { useCallback } from "react"
import { RasterEffect, type RasterEffectCallback } from "pictel"
import { luminance } from "./utils/luminance"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

/** Which channel of the mask map drives the clip. */
export type MaskSource = "alpha" | "luminance"

/**
 * Clip `pixels` to `mask`. The mask value at each pixel — its alpha channel
 * (`source="alpha"`) or its luminance (`source="luminance"`) — multiplies the
 * source alpha. RGB is untouched; only transparency changes. The two buffers
 * must have matching dimensions.
 */
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
	/** The mask. Its alpha channel — or luminance, per `source` — clips the children. Required. */
	map: ReactNode
	/** Which channel of the map drives the clip. `"alpha"` (default) or `"luminance"`. */
	source?: MaskSource
	children: ReactNode
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
 *
 * @param props
 * @category Effects
 */
export function Mask({ map, source = "alpha", children }: MaskProps) {
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
		<RasterEffect effect={effect} map={map}>
			{children}
		</RasterEffect>
	)
}
