import { useId, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useCanvasContext } from "../../context/canvas";
import { createPipelineError } from "../../utils/errors";
import { observeSubtree } from "../../utils/observe";
import { getElementsBehind } from "../../utils/stacking";
import { drawToCanvas, normalizeResult, type EffectResult } from "../utils/raster";
import { captureBehind, captureChildren } from "./utils/capture";
import { addCutout, ensureSharedMask, removeCutouts } from "./utils/masking";
import { acquirePending, releasePending } from "./utils/pending";
import { getOwnUnloadedImages } from "./utils/scope";
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

		// Concurrency guard. `inFlight` is true between gate.proceed and
		// execute's finally; gate during this window only sets `rerunQueued`
		// and returns. After execute completes, if `rerunQueued` is set, gate
		// runs once more. This collapses N observer-fired gate calls into at
		// most one rerun, eliminating overlapping snapdom captures and the
		// resulting visibility-toggle race on shared descendants.
		let inFlight = false;
		let rerunQueued = false;

		function cleanupCutouts() {
			removeCutouts(cutoutsRef.current);
			cutoutsRef.current = [];
		}

		// Behind elements are recomputed at every gate() call from the current
		// domSnapshot, with observers added/removed as the live "what's behind
		// me" set changes. A setup-time computation is unreliable: Canvas's
		// useDomSnapshot effect fires AFTER children's effects (parent-after-child
		// for layout effects), so on first mount the snapshot is null, the
		// initial behind set is empty, and the gate's behind-pending check
		// trivially passes — letting captureBehind run before the base layer
		// has finished rendering. The filter excludes the pipeline itself and
		// anything inside it: those are our own DOM, not layers we composite
		// against, but they still appear in stacking order before childrenRef
		// and intersect its rect.
		let behindElements: Array<HTMLElement> = [];
		const behindObserverMap = new Map<HTMLElement, MutationObserver>();

		function syncBehindElements(): void {
			if (!pipelineEl || !childrenEl) return;

			const currentSnapshot = domSnapshot.current;

			if (!currentSnapshot) return;

			const rawBehind = getElementsBehind(childrenEl, currentSnapshot.stackingOrder, currentSnapshot.rects);
			// Filter:
			//   - exclude self (pipelineEl)
			//   - exclude descendants (our own infrastructure DOM, not layers)
			//   - exclude ancestors (they paint before us in CSS but are "around"
			//     us, not "behind" — including them in behind-pending checks
			//     creates circular waits when this pipeline is nested inside
			//     another, and adding cutouts to ancestors masks too much).
			//   - keep only pictel pipeline elements: those are the ones that
			//     have a meaningful pending state to wait for, and the ones we
			//     want to add cutouts to (so their canvas doesn't double-render
			//     under us). Non-pipeline behind (raw <img>, <div>) will paint
			//     normally and snapdom will capture it correctly without any
			//     coordination from us.
			const newBehind = rawBehind.filter(
				(candidate) =>
					candidate !== pipelineEl
					&& !pipelineEl.contains(candidate)
					&& !candidate.contains(pipelineEl)
					&& candidate.hasAttribute("data-pictel-pipeline"),
			);
			const newBehindSet = new Set(newBehind);

			// Remove observers for elements no longer behind us.
			for (const [element, obs] of behindObserverMap) {
				if (!newBehindSet.has(element)) {
					obs.disconnect();
					behindObserverMap.delete(element);
				}
			}

			// Add observers for newly-behind elements. New observers start live;
			// if gate is proceeding, the disconnect step below will turn them
			// off symmetrically with content/mapObserver.
			for (const element of newBehind) {
				if (!behindObserverMap.has(element)) {
					const obs = new MutationObserver(() => gate());

					behindObserverMap.set(element, obs);
					observeSubtree(obs, element);
				}
			}

			behindElements = newBehind;
		}

		/** Validate-only gate. No DOM writes except installing image listeners when waiting. */
		function gate() {
			if (signal.aborted || !pipelineEl || !childrenEl || !mapEl || !rasterEl || !canvasEl) return;

			// On the first gate after mount, Canvas's useDomSnapshot effect may
			// not have run yet (parent-after-child for layout effects), so the
			// snapshot is null and we cannot identify behind elements. Defer to
			// a microtask: by then Canvas's setup has fired and the snapshot is
			// built. Without this retry, the behind-pending check trivially
			// passes (empty list) and the composite executes against an
			// un-rendered base.
			if (domSnapshot.current === null) {
				void Promise.resolve().then(() => gate());

				return;
			}

			// Recompute behind elements + observers from the current snapshot
			// before any pending check. The behind set may have changed since
			// the previous gate (pipelines rendered/remounted, dimensions changed).
			syncBehindElements();

			if (inFlight) {
				rerunQueued = true;

				return;
			}

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
					img.addEventListener("load", () => gate(), { once: true, signal });
					img.addEventListener("error", () => gate(), { once: true, signal });
				}

				return;
			}

			inFlight = true;

			// Disconnect observers BEFORE any mutation that we're about to make.
			// `acquirePending` writes data-pictel-pending on pipelineEl, which
			// is inside every behind element's subtree, so a behindObserver
			// would otherwise fire and queue a rerun before execute even
			// starts. The off-window covers acquire → execute body → release;
			// reconnection happens at the END of execute when we're done
			// mutating. See observer setup site for the full invariant.
			contentObserver.disconnect();
			mapObserver.disconnect();

			for (const obs of behindObserverMap.values()) obs.disconnect();

			acquirePending(pipelineEl);

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

				// On rerun, the previous execute set childrenEl visibility:hidden
				// to keep children in flow without painting. snapdom's foreignObject
				// SVG render of a visibility:hidden subtree produces transparent
				// pixels (the deepest non-pipeline IMG/HTML inherits hidden), so
				// reset before capture and restore after the final canvas draw.
				// This must precede ALL captures (self + behind + map).
				childrenEl.style.visibility = "";

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

				// captureBehind toggles `style.visibility` on childrenEl's
				// in-front descendants and restores. Those mutations would fire
				// contentObserver, set rerunQueued, and after this execute
				// completes a rerun would do the same thing — infinite loop.
				// Disconnect contentObserver around captureBehind; reconnect in
				// finally. We don't lose real content changes: any change to
				// childrenEl made before disconnect was already observed and
				// handled (queueing a rerun via inFlight); any change after
				// reconnect fires normally.
				try {
					const behindPromise = captureBehind(childrenEl, canvasRoot, captureDimensions, currentSnapshot.stackingOrder, currentSnapshot.rects);
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
				// Release before reconnecting — releasePending writes
				// data-pictel-pending=removed on pipelineEl, which is inside
				// every behind element. Doing it while observers are still off
				// keeps the off-window symmetric with acquire.
				if (pipelineEl) releasePending(pipelineEl);

				inFlight = false;

				if (rerunQueued && !signal.aborted) {
					// Drain a queued rerun without reconnecting: gate() will
					// proceed (or return early), and on proceed it disconnects
					// again immediately. Reconnecting and re-disconnecting
					// would just open a window for the rerun's acquire mutation
					// to fire observers.
					rerunQueued = false;
					gate();
				} else if (!signal.aborted && childrenEl && mapEl) {
					// No rerun queued — reconnect observers so future external
					// mutations can trigger gate.
					observeSubtree(contentObserver, childrenEl);
					observeSubtree(mapObserver, mapEl);

					for (const [element, obs] of behindObserverMap) {
						observeSubtree(obs, element);
					}
				}
			}
		}

		// Observers are bare gate() callbacks — no per-mutation filtering. The
		// invariant is that observers are LIVE only between executes. During
		// execute, all observers are disconnected (every write the pipeline
		// makes — drawToCanvas's canvas.width/height, dataset overflow attrs,
		// rasterEl/childrenEl style, captureBehind's visibility toggles on
		// in-front siblings, applyMaskToElement's maskImage on behind elements)
		// would otherwise fire one of these observers and queue a rerun. With
		// observers off during execute, only real external changes that arrive
		// between executes can fire gate(). React-driven changes flow through
		// effect cleanup/remount, so this is the only DOM-mutation channel
		// pictel needs.
		const contentObserver = new MutationObserver(() => gate());

		observeSubtree(contentObserver, childrenEl);

		const mapObserver = new MutationObserver(() => gate());

		observeSubtree(mapObserver, mapEl);

		gate();

		return () => {
			controller.abort();

			contentObserver.disconnect();
			mapObserver.disconnect();

			for (const obs of behindObserverMap.values()) {
				obs.disconnect();
			}

			behindObserverMap.clear();

			cleanupCutouts();

			childrenEl.style.visibility = "";
			rasterEl.style.display = "none";

			delete pipelineEl.dataset.pictelOverflowTop;
			delete pipelineEl.dataset.pictelOverflowRight;
			delete pipelineEl.dataset.pictelOverflowBottom;
			delete pipelineEl.dataset.pictelOverflowLeft;

			// Pending state: do NOT directly write data-pictel-pending. The
			// in-flight execute (if any) will run its finally and release the
			// count; the next mount's gate.proceed will acquire fresh. See
			// pending.ts for refcount semantics under StrictMode.
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
