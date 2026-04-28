import { useId, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useCanvasContext } from "../../context/canvas";
import { createPipelineError } from "../../utils/errors";
import { observeSubtree } from "../../utils/observe";
import { drawToCanvas, normalizeResult, type EffectResult } from "../utils/raster";
import { captureChildren } from "./utils/capture";
import { acquirePending, releasePending } from "./utils/pending";
import { getOwnUnloadedImages, hasOwnMutations } from "./utils/scope";
import { separateChildren } from "./utils/separate-children";

export type TargetEffectCallback = (children: ImageData, map?: ImageData) => ImageData | EffectResult | Promise<ImageData | EffectResult>;

interface TargetEffectProps {
	/** Pixel callback receiving children pixels and optional map pixels. Returns processed ImageData. */
	effect: TargetEffectCallback;
	children: ReactNode;
}

/**
 * Single-input pixel effect that captures its children and applies a transformation.
 * Used when the effect only needs the target content, not the layers behind it.
 *
 * - `effect` — Pixel callback receiving children pixels and optional map pixels. Returns processed ImageData.
 *
 * @param props
 * @category Pipeline
 */
export function TargetEffect({ effect, children }: TargetEffectProps) {
	const id = useId();
	const pipelineRef = useRef<HTMLDivElement>(null);
	const childrenRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<HTMLDivElement>(null);
	const rasterRef = useRef<HTMLDivElement>(null);
	const canvasElRef = useRef<HTMLCanvasElement>(null);

	const { captureDimensions, reportError } = useCanvasContext();
	const { content, maps } = useMemo(() => separateChildren(children), [children]);

	useLayoutEffect(() => {
		const pipelineEl = pipelineRef.current;
		const childrenEl = childrenRef.current;
		const mapEl = mapRef.current;
		const rasterEl = rasterRef.current;
		const canvasEl = canvasElRef.current;

		if (!pipelineEl || !childrenEl || !mapEl || !rasterEl || !canvasEl) return;

		// Initial: canvas hidden until first resolve.
		rasterEl.style.display = "none";

		const controller = new AbortController();
		const { signal } = controller;

		/** Validate-only gate. No DOM writes except installing image listeners when waiting. */
		function gate() {
			if (signal.aborted || !pipelineEl || !childrenEl || !mapEl || !rasterEl || !canvasEl) return;

			// Check for pending nested effects.
			if (childrenEl.querySelector("[data-pictel-pending]") !== null) return;

			if (mapEl.querySelector("[data-pictel-pending]") !== null) return;

			// Check for unloaded images (scoped to our subtree).
			const unloaded = [...getOwnUnloadedImages(childrenEl), ...getOwnUnloadedImages(mapEl)];

			if (unloaded.length > 0) {
				for (const img of unloaded) {
					img.addEventListener("load", () => gate(), { once: true, signal });
					img.addEventListener("error", () => gate(), { once: true, signal });
				}

				return;
			}

			acquirePending(pipelineEl);

			void Promise.resolve().then(() => execute());
		}

		async function execute() {
			try {
				if (signal.aborted || !pipelineEl || !childrenEl || !mapEl || !rasterEl || !canvasEl) return;

				// Size map container to match post-load content so nested effects
				// render at correct dimensions and map capture rasterizes a
				// non-zero region. Gate has already waited for images to decode.
				const contentRect = childrenEl.getBoundingClientRect();
				mapEl.style.width = `${String(contentRect.width)}px`;
				mapEl.style.height = `${String(contentRect.height)}px`;

				// On rerun, the previous execute set childrenEl visibility:hidden
				// to keep children in flow without painting. snapdom's foreignObject
				// SVG render of a visibility:hidden subtree produces transparent
				// pixels (the deepest non-pipeline IMG/HTML inherits hidden), so
				// reset before capture and restore after the canvas is drawn.
				childrenEl.style.visibility = "";

				const contentPromise = captureChildren(childrenEl, captureDimensions);
				const mapPromise = maps.length > 0 ? captureChildren(mapEl, captureDimensions) : undefined;

				const [contentPixels, mapPixels] = await Promise.all([contentPromise, mapPromise]);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (signal.aborted) return;

				const rawResult = await effect(contentPixels, mapPixels);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (signal.aborted) return;

				const { pixels, overflow } = normalizeResult(rawResult);

				drawToCanvas(canvasEl, pixels);

				pipelineEl.dataset.pictelOverflowTop = String(overflow.top);
				pipelineEl.dataset.pictelOverflowRight = String(overflow.right);
				pipelineEl.dataset.pictelOverflowBottom = String(overflow.bottom);
				pipelineEl.dataset.pictelOverflowLeft = String(overflow.left);

				// Reveal the canvas; hide children with visibility:hidden (not
				// display:none) so children stay in flow and drive the pipeline's
				// layout size. display:none would collapse the pipeline to zero
				// and, more importantly, take nested pipelines out of layout so
				// they can't recompute on parameter changes.
				rasterEl.style.display = "";
				childrenEl.style.visibility = "hidden";
			} catch (error: unknown) {
				if (signal.aborted) return;

				reportError(createPipelineError(id, error));
			} finally {
				// Always release: this execute's acquire (issued in gate)
				// must be balanced. Aborted executes still release — under
				// StrictMode, a second mount has already acquired, so the count
				// stays > 0 and the attribute stays "true" for outer readers.
				if (pipelineEl) releasePending(pipelineEl);
			}
		}

		const contentObserver = new MutationObserver((mutations) => {
			if (hasOwnMutations(mutations, childrenEl, childrenEl)) gate();
		});

		observeSubtree(contentObserver, childrenEl);

		const mapObserver = new MutationObserver((mutations) => {
			if (hasOwnMutations(mutations, mapEl, mapEl)) gate();
		});

		observeSubtree(mapObserver, mapEl);

		gate();

		return () => {
			controller.abort();

			contentObserver.disconnect();
			mapObserver.disconnect();

			// Reset visibility/display so the next mount starts from a clean
			// "children visible, raster hidden" state — the same state that
			// renders right after first JSX commit.
			childrenEl.style.visibility = "";
			rasterEl.style.display = "none";

			delete pipelineEl.dataset.pictelOverflowTop;
			delete pipelineEl.dataset.pictelOverflowRight;
			delete pipelineEl.dataset.pictelOverflowBottom;
			delete pipelineEl.dataset.pictelOverflowLeft;

			// The in-flight execute (if any) will run its finally and release
			// the pending count. The next mount's gate.proceed will acquire
			// fresh. Refcount semantics in pending.ts handle the StrictMode
			// concurrent acquire/release safely. We do NOT directly write
			// data-pictel-pending here.
		};
	}, [id, effect, maps, captureDimensions, reportError]);

	return (
		<div
			ref={pipelineRef}
			data-pictel-pipeline
			data-pictel-pending
			style={{ position: "relative", isolation: "isolate" }}
		>
			<div ref={childrenRef}>{content}</div>
			<div style={{ position: "absolute", left: "-10000px", pointerEvents: "none" }}>
				<div ref={mapRef}>{maps}</div>
			</div>
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
