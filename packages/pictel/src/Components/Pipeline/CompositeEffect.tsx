import { useId, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useCanvasContext } from "../../context/canvas";
import { createPipelineError } from "../../utils/errors";
import { observeSubtree } from "../../utils/observe";
import { getElementsBehind } from "../../utils/stacking";
import { drawToCanvas, normalizeResult, type EffectResult } from "../utils/raster";
import { captureBehind, captureChildren } from "./utils/capture";
import { addCutout, ensureSharedMask, removeCutouts } from "./utils/masking";
import { getOwnUnloadedImages, hasExternalMutations, hasOwnMutations } from "./utils/scope";
import { separateChildren } from "./utils/separate-children";

export type CompositeEffectCallback = (self: ImageData, behind: ImageData, map?: ImageData) => ImageData | EffectResult | Promise<ImageData | EffectResult>;

interface CompositeEffectProps {
	/** Pixel callback receiving self pixels, behind pixels, and optional map pixels. Returns processed ImageData. */
	effect: CompositeEffectCallback;
	children: ReactNode;
}

/**
 * Two-input pixel effect that composites its children against the layers behind them.
 * Captures both self and behind pixels, applies an effect callback, and renders the result.
 *
 * - `effect` — Pixel callback receiving self pixels, behind pixels, and optional map pixels. Returns processed ImageData.
 *
 * @param props
 * @category Pipeline
 */
export function CompositeEffect({ effect, children }: CompositeEffectProps) {
	const id = useId();
	const pipelineRef = useRef<HTMLDivElement>(null);
	const childrenRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<HTMLDivElement>(null);
	const rasterRef = useRef<HTMLDivElement>(null);
	const canvasElRef = useRef<HTMLCanvasElement>(null);
	const cutoutsRef = useRef<Array<SVGRectElement>>([]);

	const { domSnapshot, maskDefs: maskDefsRef, canvasRoot: canvasRootRef, captureDimensions, reportError } = useCanvasContext();
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

		function cleanupCutouts() {
			removeCutouts(cutoutsRef.current);
			cutoutsRef.current = [];
		}

		// Behind elements are discovered once at setup. Filter out the pipeline
		// itself and anything inside it — those are our own DOM, not a layer we
		// composite against. Without this filter the pipeline div (and its
		// infrastructure wrappers) appear in behindElements because they precede
		// childrenRef in the stacking order and intersect its rect.
		const setupSnapshot = domSnapshot.current;
		const rawBehind = setupSnapshot ? getElementsBehind(childrenEl, setupSnapshot.stackingOrder, setupSnapshot.rects) : [];
		const behindElements = rawBehind.filter((candidate) => candidate !== pipelineEl && !pipelineEl.contains(candidate));

		/** Validate-only gate. No DOM writes except installing image listeners when waiting. */
		function gate() {
			if (signal.aborted || !pipelineEl || !childrenEl || !mapEl || !rasterEl || !canvasEl) return;

			// Check for pending nested effects.
			if (childrenEl.querySelector("[data-pictel-pending]") !== null) return;

			if (mapEl.querySelector("[data-pictel-pending]") !== null) return;

			// Check for pending behind elements. Ancestors of the pipeline appear
			// here too; their pending-descendants query would always find our own
			// pipelineEl (which we marked pending). Exclude anything inside our
			// own pipelineEl from the pending scan.
			const hasPendingBehind = behindElements.some((behind) => {
				if (behind.getAttribute("data-pictel-pending") === "true") return true;

				const pendingNodes = behind.querySelectorAll("[data-pictel-pending]");

				for (const node of pendingNodes) {
					if (node !== pipelineEl && !pipelineEl.contains(node)) return true;
				}

				return false;
			});

			if (hasPendingBehind) return;

			// Check for unloaded images: our own subtree plus any behind elements
			// we'll be capturing pixels from. captureBehind uses snapdom on the
			// canvas root, which needs the behind element's images decoded.
			const unloaded = [...getOwnUnloadedImages(childrenEl), ...getOwnUnloadedImages(mapEl)];

			for (const behindElement of behindElements) {
				unloaded.push(...getOwnUnloadedImages(behindElement));
			}

			if (unloaded.length > 0) {
				for (const img of unloaded) {
					img.addEventListener("load", gate, { once: true, signal });
					img.addEventListener("error", gate, { once: true, signal });
				}

				return;
			}

			pipelineEl.setAttribute("data-pictel-pending", "true");

			void Promise.resolve().then(() => execute());
		}

		async function execute() {
			try {
				if (signal.aborted || !pipelineEl || !childrenEl || !mapEl || !rasterEl || !canvasEl) return;

				const currentSnapshot = domSnapshot.current;

				if (!currentSnapshot) return;

				const canvasRoot = canvasRootRef.current;

				if (!canvasRoot) return;

				const maskDefs = maskDefsRef.current;

				if (!maskDefs) return;

				// Size map container to match post-load content so nested effects
				// render at correct dimensions and map capture rasterizes a
				// non-zero region. Gate has already waited for images to decode.
				const contentRect = childrenEl.getBoundingClientRect();
				mapEl.style.width = `${String(contentRect.width)}px`;
				mapEl.style.height = `${String(contentRect.height)}px`;

				// Self and behind captures cannot run in parallel: captureBehind
				// sets `visibility: hidden` on childrenEl and its descendants-in-front
				// (a DOM element's own descendants sit higher in the stacking order
				// than the element itself, so they land in the "in front" set).
				// snapdom inside captureChildren observes that cascade mid-clone and
				// produces transparent pixels. Capture self first, then run behind
				// and map in parallel.
				const selfPixels = await captureChildren(childrenEl, captureDimensions);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (signal.aborted) return;

				// Detach our previous cutouts synchronously before captureBehind
				// runs snapdom — otherwise the behind elements are still masked
				// at our component's region and the captured pixels there are
				// transparent. Re-attach in finally so an error or abort mid-
				// capture doesn't leave the mask defs in a broken state; the
				// cleanupCutouts() call below removes them entirely before the
				// new positions are applied.
				const detachedCutouts = cutoutsRef.current.map((cutout) => ({ cutout, parent: cutout.parentNode }));

				for (const { cutout } of detachedCutouts) cutout.remove();

				let behindPixels: ImageData;
				let mapPixels: ImageData | undefined;

				try {
					const behindPromise = captureBehind(childrenEl, canvasRoot, captureDimensions, currentSnapshot.stackingOrder, currentSnapshot.rects, signal);
					const mapPromise = maps.length > 0 ? captureChildren(mapEl, captureDimensions) : undefined;

					[behindPixels, mapPixels] = await Promise.all([behindPromise, mapPromise]);
				} finally {
					for (const { cutout, parent } of detachedCutouts) {
						if (parent) parent.appendChild(cutout);
					}
				}

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (signal.aborted) return;

				const rawResult = await effect(selfPixels, behindPixels, mapPixels);

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

				// Cutouts match our visible footprint — the pipeline div, which is
				// sized by children-in-flow.
				const sourceRect = pipelineEl.getBoundingClientRect();
				const canvasRect = currentSnapshot.canvasRect;

				cleanupCutouts();

				for (const behindElement of behindElements) {
					const sharedMask = ensureSharedMask(behindElement, maskDefs);
					const cutout = addCutout(sharedMask, sourceRect, canvasRect);

					cutoutsRef.current.push(cutout);
				}
			} catch (error: unknown) {
				if (signal.aborted) return;

				reportError(createPipelineError(id, error));
			} finally {
				pipelineEl?.removeAttribute("data-pictel-pending");
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

		const behindObservers: Array<MutationObserver> = [];

		for (const behindElement of behindElements) {
			// Behind elements may be ancestors of pipelineEl. Filter mutations
			// that originate inside our own pipeline so our writes don't loop
			// gate() indefinitely.
			const behindObserver = new MutationObserver((mutations) => {
				if (hasExternalMutations(mutations, pipelineEl)) gate();
			});

			behindObservers.push(behindObserver);
			observeSubtree(behindObserver, behindElement);
		}

		pipelineEl.addEventListener("pictel:resize", gate, { signal });

		gate();

		return () => {
			controller.abort();

			contentObserver.disconnect();
			mapObserver.disconnect();

			for (const obs of behindObservers) {
				obs.disconnect();
			}

			cleanupCutouts();

			pipelineEl.setAttribute("data-pictel-pending", "true");
			childrenEl.style.visibility = "";
			rasterEl.style.display = "none";

			delete pipelineEl.dataset.pictelOverflowTop;
			delete pipelineEl.dataset.pictelOverflowRight;
			delete pipelineEl.dataset.pictelOverflowBottom;
			delete pipelineEl.dataset.pictelOverflowLeft;
		};
	}, [id, effect, maps, domSnapshot, maskDefsRef, canvasRootRef, captureDimensions, reportError]);

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
