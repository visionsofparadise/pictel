type Fit = "cover" | "contain" | "fill" | "none";

/**
 * Compute the destination rect to pass to `CanvasRenderingContext2D.drawImage`
 * for the given source and destination dimensions under a fit mode. The result
 * is the `(dx, dy, dw, dh)` argument set in `drawImage`'s 5-argument form.
 *
 * Matches CSS `object-fit` semantics:
 * - `fill` stretches the source to fully cover the destination.
 * - `cover` scales the source uniformly to cover the destination, cropping overflow.
 * - `contain` scales the source uniformly to fit inside the destination, letterboxing.
 * - `none` draws the source at intrinsic size centered in the destination.
 */
export function computeFitRect(
	srcW: number,
	srcH: number,
	dstW: number,
	dstH: number,
	fit: Fit,
): { x: number; y: number; w: number; h: number } {
	if (fit === "fill") {
		return { x: 0, y: 0, w: dstW, h: dstH };
	}

	if (fit === "none") {
		return {
			x: (dstW - srcW) / 2,
			y: (dstH - srcH) / 2,
			w: srcW,
			h: srcH,
		};
	}

	const scale = fit === "cover"
		? Math.max(dstW / srcW, dstH / srcH)
		: Math.min(dstW / srcW, dstH / srcH);

	const scaledW = srcW * scale;
	const scaledH = srcH * scale;

	return {
		x: (dstW - scaledW) / 2,
		y: (dstH - scaledH) / 2,
		w: scaledW,
		h: scaledH,
	};
}
