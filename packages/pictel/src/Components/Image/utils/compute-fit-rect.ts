type Fit = "cover" | "contain" | "fill" | "none";

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
