import { useContext, useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { CanvasContext } from "../../context/canvas";
import { createPipelineError } from "../../utils/errors";
import { observeSubtree } from "../../utils/observe";
import { drawToCanvas, normalizeResult, type EffectResult } from "../utils/raster";
import { captureWrapper } from "./utils/capture";
import { acquirePending, releasePending } from "./utils/pending";
import { getOwnUnloadedImages } from "./utils/scope";

/**
 * Unified effect callback receiving the target (children) pixels and
 * optional apply/map pixels. Returns the processed pixels (as ImageData or
 * EffectResult; overflow defaults to zero when returning a bare ImageData).
 *
 * - `target` — pixels from children (base layer, in-flow, drives layout)
 * - `apply` — pixels from the `apply` prop subtree (overlay layer for blends), present when `apply` prop is set
 * - `map` — pixels from the `map` prop subtree (parameter modulation for effects), present when `map` prop is set
 */
export type PipelineCallback = (
	target: ImageData,
	apply?: ImageData,
	map?: ImageData,
) => ImageData | EffectResult | Promise<ImageData | EffectResult>;

interface PipelineProps {
	/**
	 * Effect callback. Receives target pixels (children), optional apply pixels
	 * (overlay layer), and optional map pixels (parameter map).
	 */
	effect: PipelineCallback;
	/**
	 * Base layer content. Renders in normal flow and drives the pipeline's
	 * layout footprint. After resolve, hidden via `visibility: hidden` (stays
	 * in layout so the pipeline div retains its size).
	 */
	children: ReactNode;
	/**
	 * Overlay layer for blend modes. Rendered into a pictel-owned offscreen
	 * container; captured in parallel with children. Not visible in live DOM.
	 */
	apply?: ReactNode;
	/**
	 * Parameter map for map-driven effects. Rendered into a pictel-owned
	 * offscreen container; captured in parallel with children. Not visible in
	 * live DOM.
	 */
	map?: ReactNode;
}

const FALLBACK_SIZE = 0;

/**
 * Unified pipeline primitive. Handles all effect and blend cases through
 * prop-carried secondary inputs.
 *
 * DOM structure:
 * 1. `<div ref={childrenRef}>{children}</div>` — in flow, drives layout
 * 2. Offscreen apply container (only when `apply` prop is set)
 * 3. Offscreen map container (only when `map` prop is set)
 * 4. `<div ref={rasterRef} data-pictel-raster>` — absolute canvas overlay
 *
 * All three wrappers (children, apply, map) are observed for changes and
 * captured in parallel via snapdom (or fast path when eligible).
 *
 * @param props
 * @category Pipeline
 */
export function Pipeline({ effect, children, apply, map }: PipelineProps) {
	const id = useId();
	const pipelineRef = useRef<HTMLDivElement>(null);
	const childrenRef = useRef<HTMLDivElement>(null);
	const applyRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<HTMLDivElement>(null);
	const rasterRef = useRef<HTMLDivElement>(null);
	const canvasElRef = useRef<HTMLCanvasElement>(null);

	// Read canvas reference dimensions at render time for pre-sizing offscreen
	// wrappers. This prevents generative components (ConicGradient, DotPattern,
	// etc.) that use useContainerSize from rendering at 0×0 on first mount.
	// useContext rather than useCanvasContext so Pipeline can be used outside a
	// Canvas (where the context is null).
	const canvasContextValue = useContext(CanvasContext);
	const preW = canvasContextValue?.dimensions.width ?? FALLBACK_SIZE;
	const preH = canvasContextValue?.dimensions.height ?? FALLBACK_SIZE;
	const captureDimensions = canvasContextValue?.captureDimensions ?? { width: preW, height: preH };
	const reportError = canvasContextValue?.reportError;

	const hasApply = apply !== undefined;
	const hasMap = map !== undefined;

	useLayoutEffect(() => {
		const pipelineEl = pipelineRef.current;
		const childrenEl = childrenRef.current;
		const rasterEl = rasterRef.current;
		const canvasEl = canvasElRef.current;

		if (!pipelineEl || !childrenEl || !rasterEl || !canvasEl) return;

		// Apply/map refs are only present when the prop is set.
		const applyEl = hasApply ? applyRef.current : null;
		const mapEl = hasMap ? mapRef.current : null;

		// Initial: canvas hidden until first resolve.
		rasterEl.style.display = "none";

		const controller = new AbortController();
		const { signal } = controller;

		// Concurrency guard: inFlight is true between gate.proceed and execute's
		// finally. gate() during this window only sets rerunQueued and returns.
		// After execute completes, if rerunQueued is set, gate runs once more.
		let inFlight = false;
		let rerunQueued = false;

		/** Validate-only gate. No DOM writes except installing image listeners when waiting. */
		function gate() {
			if (signal.aborted || !pipelineEl || !childrenEl || !rasterEl || !canvasEl) return;

			if (inFlight) {
				rerunQueued = true;

				return;
			}

			// Check for pending nested effects in all three wrappers.
			if (childrenEl.querySelector("[data-pictel-pending]") !== null) return;

			if (applyEl !== null && applyEl.querySelector("[data-pictel-pending]") !== null) return;

			if (mapEl !== null && mapEl.querySelector("[data-pictel-pending]") !== null) return;

			// Check for unloaded images (scoped to our subtree).
			const unloaded = [
				...getOwnUnloadedImages(childrenEl),
				...(applyEl !== null ? getOwnUnloadedImages(applyEl) : []),
				...(mapEl !== null ? getOwnUnloadedImages(mapEl) : []),
			];

			if (unloaded.length > 0) {
				for (const img of unloaded) {
					img.addEventListener("load", () => gate(), { once: true, signal });
					img.addEventListener("error", () => gate(), { once: true, signal });
				}

				return;
			}

			// Bail when the children wrapper has zero size — the canvas cannot
			// capture a zero-area region. A ResizeObserver installed below
			// re-triggers gate() as soon as the wrapper gains a non-zero size.
			//
			// Use offsetWidth/Height (layout box, transform-independent) rather than
			// getBoundingClientRect (post-transform). Display mode wraps Frame in a
			// CSS transform:scale to fit the host container while keeping the DOM
			// at literal buffer dims; getBoundingClientRect would return the
			// post-transform visible size, which is smaller than the buffer.
			const childrenW = childrenEl.offsetWidth;
			const childrenH = childrenEl.offsetHeight;

			if (childrenW === 0 && childrenH === 0) return;

			inFlight = true;

			// Disconnect observers BEFORE any mutation. acquirePending and
			// releasePending write data-pictel-pending on pipelineEl; drawToCanvas
			// and post-success writes touch canvas/dataset/style. Cover the entire
			// acquire → execute body → release window with one disconnect/reconnect
			// pair.
			contentObserver.disconnect();

			if (applyObserver !== null) applyObserver.disconnect();

			if (mapObserver !== null) mapObserver.disconnect();

			acquirePending(pipelineEl);

			void Promise.resolve().then(() => execute());
		}

		async function execute() {
			try {
				if (signal.aborted || !pipelineEl || !childrenEl || !rasterEl || !canvasEl) return;

				// Size apply and map offscreen wrappers to match children so nested
				// effects inside them render at the correct dimensions, and their
				// snapdom captures rasterize a non-zero region. Gate has already
				// waited for images to decode.
				//
				// offsetWidth/Height returns the layout box (transform-independent).
				// Display mode applies CSS transform:scale on Frame for visual
				// fit-to-container; the underlying DOM stays at literal buffer dims.
				const contentW = childrenEl.offsetWidth;
				const contentH = childrenEl.offsetHeight;

				if (applyEl !== null) {
					applyEl.style.width = `${String(contentW)}px`;
					applyEl.style.height = `${String(contentH)}px`;
				}

				if (mapEl !== null) {
					mapEl.style.width = `${String(contentW)}px`;
					mapEl.style.height = `${String(contentH)}px`;
				}

				// On rerun, the previous execute set childrenEl visibility:hidden to
				// keep children in layout without painting. snapdom's foreignObject SVG
				// render of a visibility:hidden subtree produces transparent pixels, so
				// reset before capture and restore after the canvas is drawn.
				// Use "visible" (not "") to override any inherited visibility:hidden from
				// an ancestor pipeline that has already hidden its own childrenEl — CSS
				// inheritance would otherwise propagate the hidden state into this
				// pipeline's content on re-runs.
				childrenEl.style.visibility = "visible";

				// Capture all three present wrappers in parallel.
				const [targetPixels, applyPixels, mapPixels] = await Promise.all([
					captureWrapper(childrenEl, captureDimensions),
					applyEl !== null ? captureWrapper(applyEl, captureDimensions) : Promise.resolve(undefined),
					mapEl !== null ? captureWrapper(mapEl, captureDimensions) : Promise.resolve(undefined),
				]);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (signal.aborted) return;

				const rawResult = await effect(targetPixels, applyPixels, mapPixels);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (signal.aborted) return;

				const { pixels, overflow } = normalizeResult(rawResult);

				drawToCanvas(canvasEl, pixels);

				pipelineEl.dataset.pictelOverflowTop = String(overflow.top);
				pipelineEl.dataset.pictelOverflowRight = String(overflow.right);
				pipelineEl.dataset.pictelOverflowBottom = String(overflow.bottom);
				pipelineEl.dataset.pictelOverflowLeft = String(overflow.left);

				// Reveal canvas; hide children with visibility:hidden (not
				// display:none) so children stay in flow and drive the pipeline's
				// layout size.
				rasterEl.style.display = "";
				childrenEl.style.visibility = "hidden";
			} catch (error: unknown) {
				if (signal.aborted) return;

				if (reportError) {
					reportError(createPipelineError(id, error));
				}
			} finally {
				// Release before reconnecting — releasePending writes
				// data-pictel-pending=removed on pipelineEl. Doing it while
				// observers are still off keeps the off-window symmetric with acquire.
				if (pipelineEl) releasePending(pipelineEl);

				inFlight = false;

				if (rerunQueued && !signal.aborted) {
					// Drain without reconnecting: gate() will disconnect again on proceed.
					rerunQueued = false;
					gate();
				} else if (!signal.aborted && childrenEl) {
					// No rerun queued — reconnect observers so future external
					// mutations can trigger gate.
					observeSubtree(contentObserver, childrenEl);

					if (applyObserver !== null && applyEl !== null) observeSubtree(applyObserver, applyEl);

					if (mapObserver !== null && mapEl !== null) observeSubtree(mapObserver, mapEl);
				}
			}
		}

		// Observers are bare gate() callbacks. The invariant: observers are LIVE
		// only between executes. During execute, all observers are disconnected so
		// our own DOM writes don't loop.
		const contentObserver = new MutationObserver(() => gate());

		observeSubtree(contentObserver, childrenEl);

		const applyObserver: MutationObserver | null = applyEl !== null
			? new MutationObserver(() => gate())
			: null;

		if (applyObserver !== null && applyEl !== null) observeSubtree(applyObserver, applyEl);

		const mapObserver: MutationObserver | null = mapEl !== null
			? new MutationObserver(() => gate())
			: null;

		if (mapObserver !== null && mapEl !== null) observeSubtree(mapObserver, mapEl);

		// Re-trigger gate when the children wrapper gains a non-zero size.
		// This covers the case where gate() returned early due to the zero-size
		// check above — a MutationObserver alone won't fire on a resize that
		// happens through CSS/layout without a DOM mutation.
		const sizeObserver = new ResizeObserver(() => {
			if (signal.aborted) return;

			gate();
		});

		sizeObserver.observe(childrenEl);

		gate();

		return () => {
			controller.abort();

			contentObserver.disconnect();

			if (applyObserver !== null) applyObserver.disconnect();

			if (mapObserver !== null) mapObserver.disconnect();

			sizeObserver.disconnect();

			// Reset visibility/display so the next mount starts from a clean
			// "children visible, raster hidden" state.
			childrenEl.style.visibility = "";
			rasterEl.style.display = "none";

			delete pipelineEl.dataset.pictelOverflowTop;
			delete pipelineEl.dataset.pictelOverflowRight;
			delete pipelineEl.dataset.pictelOverflowBottom;
			delete pipelineEl.dataset.pictelOverflowLeft;

			// The in-flight execute (if any) will run its finally and release the
			// pending count. The next mount's gate.proceed will acquire fresh.
			// Refcount semantics in pending.ts handle StrictMode safely.
		};
	 
	}, [id, effect, hasApply, hasMap, captureDimensions, reportError]);

	return (
		<div
			ref={pipelineRef}
			data-pictel-pipeline
			data-pictel-pending
			style={{ position: "relative", isolation: "isolate" }}
		>
			<div ref={childrenRef}>{children}</div>
			{hasApply && (
				<div
					style={{
						position: "absolute",
						left: "-10000px",
						top: 0,
						width: preW > 0 ? preW : undefined,
						height: preH > 0 ? preH : undefined,
						pointerEvents: "none",
					}}
				>
					<div
						ref={applyRef}
						style={{ width: "100%", height: "100%" }}
					>
						{apply}
					</div>
				</div>
			)}
			{hasMap && (
				<div
					style={{
						position: "absolute",
						left: "-10000px",
						top: 0,
						width: preW > 0 ? preW : undefined,
						height: preH > 0 ? preH : undefined,
						pointerEvents: "none",
					}}
				>
					<div
						ref={mapRef}
						style={{ width: "100%", height: "100%" }}
					>
						{map}
					</div>
				</div>
			)}
			<div
				ref={rasterRef}
				data-pictel-raster
				style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
			>
				<canvas
					ref={canvasElRef}
					style={{ display: "block", width: "100%", height: "100%" }}
				/>
			</div>
		</div>
	);
}

Pipeline.displayName = "Pipeline";
