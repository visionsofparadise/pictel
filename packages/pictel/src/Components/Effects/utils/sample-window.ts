/** Half-open pixel rectangle `[startX, endX) × [startY, endY)`. */
export interface SampleWindow {
	startX: number
	startY: number
	endX: number
	endY: number
}

/**
 * The pixel rectangle a halftone cell samples coverage from, for a dot whose
 * center sits at `(sourceCx, sourceCy)` in source space.
 *
 * The window is anchored on the pixel nearest the dot center (`round`, not
 * `floor`/`ceil`) and given a fixed `2 * half`-pixel span, so — before any
 * edge clamp — it is always exactly `dotSize` pixels on a side and its
 * centroid sits within ±0.5px of the dot for *every* cell of *every* channel.
 *
 * A `floor`/`ceil` window instead grows to an asymmetric `dotSize + 1` span
 * whenever the dot center is fractional. The CMYK screens rotate to different
 * angles, so the rotated ones (Cyan 15°, Magenta 75°, Key 45°) land on
 * fractional lattice points while Yellow (0°) lands on integers — meaning each
 * channel sampled coverage from a differently-sized window drifting off its
 * dot by a channel-specific, cell-varying amount. The four separations then
 * disagreed about where image content sat: a registration artifact. A fixed,
 * round-anchored window samples identically for all four screens, holding them
 * in register.
 */
export function sampleWindow(width: number, height: number, sourceCx: number, sourceCy: number, half: number): SampleWindow {
	const anchorX = Math.round(sourceCx - half)
	const anchorY = Math.round(sourceCy - half)
	const span = Math.round(half * 2)

	return {
		startX: Math.max(0, anchorX),
		startY: Math.max(0, anchorY),
		endX: Math.min(width, anchorX + span),
		endY: Math.min(height, anchorY + span),
	}
}
