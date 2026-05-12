import { useCallback } from "react";
import { RasterSource } from "../Pipeline/RasterSource";

type Fit = "cover" | "contain" | "fill" | "none";

interface ImageProps {
	/** Source URL or data URL to decode into the leaf canvas. */
	src: string;
	/** Output width in pixels. Sets the canvas backing buffer and the CSS box. */
	width: number;
	/** Output height in pixels. */
	height: number;
	/**
	 * How the decoded source maps into the `width × height` output box.
	 * Semantics match CSS `object-fit`.
	 *
	 * - `cover` (default) — fills output, cropping overflow.
	 * - `contain` — fits inside output, letterboxing with transparency.
	 * - `fill` — stretches to output dimensions.
	 * - `none` — draws at the source's intrinsic size, centered, clipping overflow.
	 */
	fit?: Fit;
	/** CORS mode for cross-origin sources. Forwarded to the underlying image element. */
	crossOrigin?: "anonymous" | "use-credentials";
}

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
 *
 * @category Raster Source
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

/**
 * Loads a raster image source once on mount, decodes it via the browser's
 * native image loader, and draws the decoded pixels into the leaf canvas at
 * the requested fit. The source decode happens once per `src` change — not
 * once per capture — so parent pipeline captures read pixels from the leaf
 * canvas, never re-decoding the source bytes.
 *
 * Renders through {@link RasterSource}, so the emitted DOM matches the
 * `[data-pictel-pipeline]` + `[data-pictel-raster] > canvas` contract that
 * lets a parent pipeline's capture take the fast path when intrinsic dims
 * match the requested capture dims.
 *
 * Decode failures (network error, malformed image, abort) clear pending and
 * leave the canvas blank. No error is surfaced to `reportError` — Image is a
 * leaf, and the pipeline error log is reserved for effect callbacks.
 *
 * Closed API: no `className`, `style`, `id`, `data-*`, `aria-*`, event
 * handlers, or ref forwarding. Wrap in a styled `<div>` if positioning is
 * needed.
 *
 * @param props
 * @category Raster Source
 */
export function Image({ src, width, height, fit = "cover", crossOrigin }: ImageProps) {
	const draw = useCallback(
		async (canvas: HTMLCanvasElement, signal: AbortSignal) => {
			// `new window.Image()` rather than `new Image()`: the exported `Image`
			// component shadows the global `Image` constructor inside this module's
			// scope, so we must reach for the constructor via `window`.
			const img = new window.Image();

			if (crossOrigin) img.crossOrigin = crossOrigin;

			img.src = src;

			try {
				await img.decode();
			} catch {
				// Decode failure: leave the canvas blank. RasterSource is a leaf;
				// no reportError surfacing per design.
				return;
			}

			if (signal.aborted) return;

			const context = canvas.getContext("2d");

			if (!context) return;

			const rect = computeFitRect(img.naturalWidth, img.naturalHeight, width, height, fit);

			context.drawImage(img, rect.x, rect.y, rect.w, rect.h);
		},
		[src, width, height, fit, crossOrigin],
	);

	return <RasterSource width={width} height={height} draw={draw} />;
}

Image.displayName = "Image";
