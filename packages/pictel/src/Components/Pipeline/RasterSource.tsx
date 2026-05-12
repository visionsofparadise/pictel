import { useLayoutEffect, useRef } from "react";
import { acquirePending, releasePending } from "./utils/pending";

/**
 * Props for the {@link RasterSource} primitive.
 */
export interface RasterSourceProps {
	/** Intrinsic width in pixels. Sets the canvas backing buffer and the CSS box. */
	width: number;
	/** Intrinsic height in pixels. */
	height: number;
	/**
	 * Draw callback. Receives the leaf canvas and an AbortSignal. May be sync
	 * (gradients, patterns) or async (Image, which awaits decode before drawing).
	 * The canvas backing buffer is pre-sized to `width × height` before the
	 * callback runs.
	 *
	 * Stability matters: the layout effect re-runs whenever `draw`'s identity
	 * changes, which re-acquires pending and triggers a full re-capture in any
	 * wrapping Pipeline. Consumers should wrap `draw` in `useCallback` and use
	 * content-based keys (e.g. a serialized stops array) in the deps for inputs
	 * that may be inline-literal arrays or objects.
	 */
	draw: (canvas: HTMLCanvasElement, signal: AbortSignal) => void | Promise<void>;
}

/**
 * Shared leaf primitive for raster-producing components (Image, generatives).
 * Emits the same `[data-pictel-pipeline]` + `[data-pictel-raster] > canvas`
 * DOM contract as a resolved {@link Pipeline}, so a parent capture recognizes
 * it via {@link tryFastPath} and reads the canvas ImageData directly when
 * intrinsic dims match the requested capture dims.
 *
 * The `data-pictel-pending` attribute is managed entirely through
 * `acquirePending` / `releasePending` (refcounted, StrictMode-safe). The JSX
 * does NOT set the attribute — instead `useLayoutEffect` acquires pending
 * synchronously before any parent pipeline's layout effect runs (child layout
 * effects run before parents per React semantics), so the parent's first
 * gate observes the leaf as pending.
 *
 * Closed API: no `className`, `style`, `id`, `data-*`, `aria-*`, event
 * handlers, or ref forwarding. Wrap in a styled `<div>` if positioning is
 * needed. Matches the closed effect-component API (2026-04-09).
 *
 * @param props
 * @category Pipeline
 */
export function RasterSource({ width, height, draw }: RasterSourceProps) {
	const pipelineRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useLayoutEffect(() => {
		const pipelineEl = pipelineRef.current;
		const canvasEl = canvasRef.current;

		if (!pipelineEl || !canvasEl) return;

		// Acquire FIRST — before any other work — so that by the time a parent
		// Pipeline's useLayoutEffect runs (parents run after children per React
		// semantics) and calls its first gate, this leaf already carries
		// data-pictel-pending. Otherwise the parent could capture before we draw.
		acquirePending(pipelineEl);

		const controller = new AbortController();
		const { signal } = controller;

		canvasEl.width = width;
		canvasEl.height = height;

		// Uniformly handle sync and async draw return values via Promise.resolve.
		// The .then / .catch must check signal.aborted first; cleanup is the one
		// that releases when aborted, so the in-flight chain must NOT release in
		// that case (refcount would underflow / clamp at 0 but order is unclear).
		Promise.resolve(draw(canvasEl, signal)).then(
			() => {
				if (signal.aborted) return;

				releasePending(pipelineEl);
			},
			() => {
				if (signal.aborted) return;

				releasePending(pipelineEl);
			},
		);

		return () => {
			controller.abort();
			// Release here. If the in-flight chain has not yet resolved, its
			// .then/.catch sees signal.aborted=true and bails without releasing,
			// so this single release matches the earlier acquire. If the chain
			// already resolved (and released), this second releasePending is a
			// no-op because the refcount clamps at 0 (see pending.ts).
			releasePending(pipelineEl);
		};
	}, [width, height, draw]);

	return (
		<div
			ref={pipelineRef}
			data-pictel-pipeline
			style={{ position: "relative", isolation: "isolate", width, height }}
		>
			<div
				data-pictel-raster
				style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
			>
				<canvas
					ref={canvasRef}
					style={{ display: "block", width: "100%", height: "100%" }}
				/>
			</div>
		</div>
	);
}

RasterSource.displayName = "RasterSource";
