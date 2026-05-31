import { useCallback } from "react";
import { RasterSource } from "../RasterEffect/RasterSource";
import { computeFitRect } from "./utils/compute-fit-rect";

type Fit = "cover" | "contain" | "fill" | "none";

interface ImageProps {
	src: string;
	width: number;
	height: number;
	fit?: Fit;
	crossOrigin?: "anonymous" | "use-credentials";
}

/**
 * Loads a raster image, decodes it, and renders it into a canvas at the requested
 * output size and fit. Use `Image` instead of a raw `<img>` for any source that will
 * be processed by effects — the decoded pixels live in a canvas that effects can read
 * directly without re-decoding the source for every capture.
 *
 * Wrap in a styled `<div>` if you need to position or style it — the API is closed
 * (no `className`, `style`, event handlers, or ref forwarding). Decode failures leave
 * the canvas blank and do not throw or surface errors.
 *
 * - `src` — Required. URL or data URL of the source image.
 * - `width` — Required. Output width in pixels. Sets the canvas backing buffer and the CSS box.
 * - `height` — Required. Output height in pixels.
 * - `fit` — How the decoded source maps into the output box. Semantics match CSS `object-fit`: `"cover"` fills the box and crops overflow; `"contain"` fits inside the box and letterboxes with transparency; `"fill"` stretches to the exact box; `"none"` draws at intrinsic size, centered, clipping overflow. Defaults to `"cover"`.
 * - `crossOrigin` — CORS mode for cross-origin sources. One of `"anonymous"` or `"use-credentials"`. Defaults to `"anonymous"` — pictel reads pixels from every image, which requires CORS-clean fetches.
 *
 * @param props
 * @category Raster Source
 */
export function Image({ src, width, height, fit = "cover", crossOrigin = "anonymous" }: ImageProps) {
	const draw = useCallback(
		async (canvas: HTMLCanvasElement, signal: AbortSignal) => {
			// `window.Image` — the exported `Image` component shadows the global constructor in this module.
			const img = new window.Image();

			img.crossOrigin = crossOrigin;

			img.src = src;

			try {
				await img.decode();
			} catch {
				// Decode failure: leave canvas blank — RasterSource is a leaf, no reportError surfacing per design.
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
