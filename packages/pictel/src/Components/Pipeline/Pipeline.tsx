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

		const applyEl = hasApply ? applyRef.current : null;
		const mapEl = hasMap ? mapRef.current : null;

		rasterEl.style.display = "none";

		const controller = new AbortController();
		const { signal } = controller;

		let inFlight = false;
		let rerunQueued = false;

		function gate() {
			if (signal.aborted || !pipelineEl || !childrenEl || !rasterEl || !canvasEl) return;

			if (inFlight) {
				rerunQueued = true;

				return;
			}

			if (childrenEl.querySelector("[data-pictel-pending]") !== null) return;

			if (applyEl !== null && applyEl.querySelector("[data-pictel-pending]") !== null) return;

			if (mapEl !== null && mapEl.querySelector("[data-pictel-pending]") !== null) return;

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

			const childrenW = childrenEl.offsetWidth;
			const childrenH = childrenEl.offsetHeight;

			if (childrenW === 0 && childrenH === 0) return;

			inFlight = true;

			contentObserver.disconnect();

			if (applyObserver !== null) applyObserver.disconnect();

			if (mapObserver !== null) mapObserver.disconnect();

			acquirePending(pipelineEl);

			void Promise.resolve().then(() => execute());
		}

		async function execute() {
			try {
				if (signal.aborted || !pipelineEl || !childrenEl || !rasterEl || !canvasEl) return;

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

				childrenEl.style.visibility = "visible";

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

				rasterEl.style.display = "";
				childrenEl.style.visibility = "hidden";
			} catch (error: unknown) {
				if (signal.aborted) return;

				if (reportError) {
					reportError(createPipelineError(id, error));
				}
			} finally {
				if (pipelineEl) releasePending(pipelineEl);

				inFlight = false;

				if (rerunQueued && !signal.aborted) {
					rerunQueued = false;
					gate();
				} else if (!signal.aborted && childrenEl) {
					observeSubtree(contentObserver, childrenEl);

					if (applyObserver !== null && applyEl !== null) observeSubtree(applyObserver, applyEl);

					if (mapObserver !== null && mapEl !== null) observeSubtree(mapObserver, mapEl);
				}
			}
		}

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

			childrenEl.style.visibility = "";
			rasterEl.style.display = "none";

			delete pipelineEl.dataset.pictelOverflowTop;
			delete pipelineEl.dataset.pictelOverflowRight;
			delete pipelineEl.dataset.pictelOverflowBottom;
			delete pipelineEl.dataset.pictelOverflowLeft;
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
