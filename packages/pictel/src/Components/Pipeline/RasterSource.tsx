import { useContext, useId, useLayoutEffect, useRef } from "react";
import { NULL_REGISTRY, PipelineContext } from "../../context/pipeline";

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
	 * changes, which re-flips this leaf to pending and triggers a full
	 * re-capture in any wrapping Pipeline. Consumers should wrap `draw` in
	 * `useCallback` and use
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
 * Pending state is reported via `PipelineContext`: `useLayoutEffect` registers
 * with the parent registry and flips a JS pendingRef synchronously before any
 * wrapping Pipeline's layout effect runs (child layout effects run before
 * parents per React semantics), so the parent's first gate observes this leaf
 * as pending via `registry.anyPending()`. The single Canvas-root
 * `data-pictel-pending` attribute is derived from the registry — no
 * per-element pending attribute exists.
 *
 * Closed API: no `className`, `style`, `id`, `data-*`, `aria-*`, event
 * handlers, or ref forwarding. Wrap in a styled `<div>` if positioning is
 * needed. Matches the closed effect-component API (2026-04-09).
 *
 * @param props
 * @category Pipeline
 */
export function RasterSource({ width, height, draw }: RasterSourceProps) {
	const id = useId();
	const pipelineRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const parentContext = useContext(PipelineContext);
	const parent = parentContext ?? NULL_REGISTRY;
	const pendingRef = useRef(true);

	useLayoutEffect(() => {
		const pipelineEl = pipelineRef.current;
		const canvasEl = canvasRef.current;

		if (!pipelineEl || !canvasEl) return;

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
