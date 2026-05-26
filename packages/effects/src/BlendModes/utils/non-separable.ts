/**
 * W3C non-separable blend mode helpers (Compositing and Blending Level 1,
 * section 10.2). Used by the `Hue`, `Saturation`, `Color`, and `Luminosity`
 * blend modes. Replaces the previous `rgbToHsl`/`hslToRgb` round-trip with the
 * direct-RGB form from the spec — no `Math.atan2`, no `% 1`, no nested
 * `hue2rgb` branches.
 *
 * All operations are on normalized `[0, 1]` RGB tuples — the same form the
 * blend formulas already receive from `blendPixels`.
 *
 * Reference: https://www.w3.org/TR/compositing-1/#blendingnonseparable
 */

export type RGB = [number, number, number]

/**
 * Luminance of an RGB color per the W3C non-separable spec:
 *   Lum(C) = 0.3 * Cred + 0.59 * Cgreen + 0.11 * Cblue
 */
export function lum(color: RGB): number {
	return 0.3 * color[0] + 0.59 * color[1] + 0.11 * color[2]
}

/**
 * Saturation of an RGB color per the W3C non-separable spec:
 *   Sat(C) = max(Cred, Cgreen, Cblue) - min(Cred, Cgreen, Cblue)
 */
export function sat(color: RGB): number {
	const cr = color[0]
	const cg = color[1]
	const cz = color[2]
	const max = cr > cg ? (cr > cz ? cr : cz) : cg > cz ? cg : cz
	const min = cr < cg ? (cr < cz ? cr : cz) : cg < cz ? cg : cz

	return max - min
}

/**
 * Clip out-of-gamut components by pulling them back toward the luminance.
 * From the W3C spec ClipColor procedure: if any component is below 0 or above
 * 1, rescale all three components around the luminance so the value range is
 * `[0, 1]` while the luminance is preserved.
 */
export function clipColor(color: RGB): RGB {
	const luminance = lum(color)
	let cr = color[0]
	let cg = color[1]
	let cz = color[2]
	const min = cr < cg ? (cr < cz ? cr : cz) : cg < cz ? cg : cz
	const max = cr > cg ? (cr > cz ? cr : cz) : cg > cz ? cg : cz

	if (min < 0) {
		const scale = luminance / (luminance - min)
		cr = luminance + (cr - luminance) * scale
		cg = luminance + (cg - luminance) * scale
		cz = luminance + (cz - luminance) * scale
	}

	if (max > 1) {
		const scale = (1 - luminance) / (max - luminance)
		cr = luminance + (cr - luminance) * scale
		cg = luminance + (cg - luminance) * scale
		cz = luminance + (cz - luminance) * scale
	}

	return [cr, cg, cz]
}

/**
 * Replace the luminance of an RGB color while preserving the chroma. From the
 * W3C SetLum procedure: shift all three components by `(l - Lum(C))`, then
 * clip out-of-gamut.
 */
export function setLum(color: RGB, luminance: number): RGB {
	const delta = luminance - lum(color)

	return clipColor([color[0] + delta, color[1] + delta, color[2] + delta])
}

/**
 * Replace the saturation of an RGB color while preserving the relative
 * ordering of the channels. From the W3C SetSat procedure: sort the channels
 * into min/mid/max, then rescale mid into `[0, saturation]` (or zero out all
 * three if the input is achromatic).
 *
 * The W3C reference pseudocode mutates the channels in place. The function
 * returns a fresh tuple to fit the blend-formula calling convention.
 */
export function setSat(color: RGB, saturation: number): RGB {
	const cr = color[0]
	const cg = color[1]
	const cz = color[2]

	// Identify the indices of the min, mid, and max channels. Ties between
	// channels are broken consistently — the relative ordering only matters
	// for the mid-channel rescale below, which is invariant to tie-break.
	let minIdx: 0 | 1 | 2
	let maxIdx: 0 | 1 | 2

	if (cr <= cg && cr <= cz) {
		minIdx = 0
		maxIdx = cg >= cz ? 1 : 2
	} else if (cg <= cr && cg <= cz) {
		minIdx = 1
		maxIdx = cr >= cz ? 0 : 2
	} else {
		minIdx = 2
		maxIdx = cr >= cg ? 0 : 1
	}

	const midIdx = (3 - minIdx - maxIdx) as 0 | 1 | 2
	const out: RGB = [0, 0, 0]
	const cmin = color[minIdx]
	const cmax = color[maxIdx]

	if (cmax > cmin) {
		out[midIdx] = ((color[midIdx] - cmin) * saturation) / (cmax - cmin)
		out[maxIdx] = saturation
	} else {
		out[midIdx] = 0
		out[maxIdx] = 0
	}

	out[minIdx] = 0

	return out
}
