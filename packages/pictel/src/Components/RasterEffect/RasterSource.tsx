import { useId, useLayoutEffect, useRef } from "react";
import { useRasterEffectContext } from "../../context/raster-effect";

export interface RasterSourceProps {
	width: number;
	height: number;
	draw: (canvas: HTMLCanvasElement, signal: AbortSignal) => void | Promise<void>;
}

/**
 * The leaf primitive for components that produce pixels from a draw callback —
 * `Image` and the generative components (`LinearGradient`, `ProceduralNoise`, etc.)
 * are built on it. Renders a canvas at the requested intrinsic size and lets the
 * `draw` callback paint into it.
 *
 * Reach for `RasterSource` when authoring a custom pixel source: anything that
 * computes pixels from props rather than capturing them from the DOM. Wrap in a
 * styled `<div>` if you need to position or style it — the API is closed
 * (no `className`, `style`, event handlers, or ref forwarding).
 *
 * - `width` — Required. Intrinsic width in pixels. Sets both the canvas backing buffer and the rendered CSS box.
 * - `height` — Required. Intrinsic height in pixels.
 * - `draw` — Required. Called with the canvas and an `AbortSignal` once the backing buffer is sized. May be sync (gradients, patterns) or async (decoding an image). Wrap in `useCallback` and use content-based keys in the deps when inputs are inline literals — identity changes re-run the draw.
 *
 * @param props
 * @category RasterEffect
 */
export function RasterSource({ width, height, draw }: RasterSourceProps) {
	const id = useId();
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const parent = useRasterEffectContext();
	const pendingRef = useRef(true);

	useLayoutEffect(() => {
		const canvasEl = canvasRef.current;

		if (!canvasEl) return;

		const unregister = parent.register(id, () => pendingRef.current);

		pendingRef.current = true;
		parent.notify(id);

		const controller = new AbortController();
		const { signal } = controller;

		canvasEl.width = width;
		canvasEl.height = height;

		Promise.resolve(draw(canvasEl, signal)).then(
			() => {
				if (signal.aborted) return;

				pendingRef.current = false;
				parent.notify(id);
			},
			() => {
				if (signal.aborted) return;

				pendingRef.current = false;
				parent.notify(id);
			},
		);

		return () => {
			controller.abort();
			pendingRef.current = false;
			parent.notify(id);
			unregister();
		};
	}, [width, height, draw, id, parent]);

	return (
		<canvas
			ref={canvasRef}
			data-pictel-raster
			data-pictel-raster-source
			width={width}
			height={height}
			style={{ width, height, display: "block" }}
		/>
	);
}

RasterSource.displayName = "RasterSource";
