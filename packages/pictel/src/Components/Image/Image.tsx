import { useCallback } from "react";
import { RasterSource } from "../RasterEffect/RasterSource";
import { computeFitRect } from "./utils/compute-fit-rect";

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
 * Loads a raster image source once on mount, decodes it via the browser's
 * native image loader, and draws the decoded pixels into the leaf canvas at
 * the requested fit. The source decode happens once per `src` change — not
 * once per capture — so parent pipeline captures read pixels from the leaf
 * canvas, never re-decoding the source bytes.
 *
 * Renders through {@link RasterSource}, so the emitted DOM is a bare
 * `<canvas data-pictel-raster>` that a parent pipeline's capture can read
 * directly via the fast path when intrinsic dims match the requested
 * capture dims.
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
