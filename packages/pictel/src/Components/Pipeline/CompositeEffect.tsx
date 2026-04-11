import { useId, useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useCanvasContext } from "../../context/canvas";
import { captureBehind, captureChildren } from "./utils/capture";
import { createPipelineError } from "../../utils/errors";
import { addCutout, ensureSharedMask, removeCutouts } from "./utils/masking";
import { observeSubtree } from "../../utils/observe";
import { drawToCanvas, normalizeResult, type EffectResult } from "../utils/raster";
import { getOwnUnloadedImages, hasExternalMutations, hasOwnMutations } from "./utils/scope";
import { getElementsBehind } from "../../utils/stacking";
import { checkStackingEscape } from "./utils/stacking-check";
import { separateChildren } from "./utils/separate-children";

export type CompositeEffectCallback = (self: ImageData, behind: ImageData, map?: ImageData) => ImageData | EffectResult | Promise<ImageData | EffectResult>;

interface CompositeEffectProps {
	/** Pixel callback receiving self pixels, behind pixels, and optional map pixels. Returns processed ImageData. */
	effect: CompositeEffectCallback;
	flatten?: boolean;
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
export function CompositeEffect({ effect, flatten, children }: CompositeEffectProps) {
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

		rasterEl.style.display = "none";

		// Size map container to match content so nested effects render at correct dimensions
		const contentRect = childrenEl.getBoundingClientRect();
		mapEl.style.width = `${String(contentRect.width)}px`;
		mapEl.style.height = `${String(contentRect.height)}px`;

		let disposed = false;
		const isDisposed = () => disposed;
		const observers: Array<MutationObserver> = [];
		// Behind-element observers live in their own array so execute() can
		// disconnect+drop them on each run without leaving dead entries in the
		// main observers array (which used to grow unboundedly across reruns).
		let behindObservers: Array<MutationObserver> = [];

		function cleanupCutouts() {
			removeCutouts(cutoutsRef.current);
			cutoutsRef.current = [];
		}

		const snapshot = domSnapshot.current;
		// Filter out any behind-stacking element that is the pipeline itself or
		// lives inside it — those are "our own" DOM, not a layer we composite
		// against. Without this filter, the pipeline div (and its infrastructure
		// wrappers) appear in behindElements because they precede childrenRef in
		// the stacking order and intersect its rect, which then breaks the
		// pending-behind check (the pipeline is pending while we're running) and
		// causes behind observers to watch subtrees that overlap our own writes.
		const rawBehind = snapshot ? getElementsBehind(childrenEl, snapshot.stackingOrder, snapshot.rects) : [];
		const behindElements = rawBehind.filter((candidate) => candidate !== pipelineEl && !pipelineEl.contains(candidate));
		const imageListeners = new Map<HTMLImageElement, { load: () => void; error: () => void }>();

		function clearImageListeners() {
			for (const [img, handlers] of imageListeners) {
				img.removeEventListener("load", handlers.load);
				img.removeEventListener("error", handlers.error);
			}

			imageListeners.clear();
		}

		/** Gated entry point — checks preconditions before scheduling execute. */
		function gate() {
			if (disposed || !pipelineEl || !childrenEl || !mapEl || !rasterEl || !canvasEl) return;

			// Reset to pre-execution state
			clearImageListeners();
			cleanupCutouts();
			pipelineEl.setAttribute("data-pictel-pending", "true");
			childrenEl.style.visibility = "";
			rasterEl.style.display = "none";

			// Check for pending nested effects
			if (childrenEl.querySelector("[data-pictel-pending]") !== null) return;

			if (mapEl.querySelector("[data-pictel-pending]") !== null) return;

			// Check for pending behind elements. Ancestors of the pipeline
			// appear here too, and their pending-descendants query would
			// always find our own pipelineEl (which is pending by construction
			// while we run). Exclude anything inside our own pipelineEl from
			// the pending scan.
			const hasPendingBehind = behindElements.some((behind) => {
				if (behind.getAttribute("data-pictel-pending") === "true") return true;

				const pendingNodes = behind.querySelectorAll("[data-pictel-pending]");

				for (const node of pendingNodes) {
					if (node !== pipelineEl && !pipelineEl.contains(node)) return true;
				}

				return false;
			});

			if (hasPendingBehind) return;

			// Check for unloaded images: our own subtree plus any behind
			// elements we'll be capturing pixels from. captureBehind uses
			// snapdom on the canvas root, which needs the behind element's
			// images decoded to produce correct pixels — so we must wait.
			const unloaded = [
				...getOwnUnloadedImages(childrenEl),
				...getOwnUnloadedImages(mapEl),
			];

			for (const behindElement of behindElements) {
				unloaded.push(...getOwnUnloadedImages(behindElement));
			}

			if (unloaded.length > 0) {
				for (const img of unloaded) {
					if (imageListeners.has(img)) continue;

					const onLoad = () => { imageListeners.delete(img); gate(); };
					const onError = () => { imageListeners.delete(img); gate(); };

					imageListeners.set(img, { load: onLoad, error: onError });
					img.addEventListener("load", onLoad, { once: true });
					img.addEventListener("error", onError, { once: true });
				}

				return;
			}

			// Stacking escape check
			const currentSnapshot = domSnapshot.current;

			if (currentSnapshot && !flatten) {
				const escaped = checkStackingEscape(childrenEl, currentSnapshot.stackingOrder);

				if (escaped) {
					reportError(
						createPipelineError(
							id,
							new Error(
								`CompositeEffect child escapes stacking context. Element "${escaped.tagName.toLowerCase()}" appears before its CompositeEffect parent in the stacking order. Add the "flatten" prop to the CompositeEffect or fix the child's z-index.`,
							),
						),
					);

					return;
				}
			}

			// All preconditions met — schedule execution
			void Promise.resolve().then(() => execute());
		}

		const contentObserver = new MutationObserver((mutations) => {
			if (hasOwnMutations(mutations, childrenEl, childrenEl)) gate();
		});
		observers.push(contentObserver);
		observeSubtree(contentObserver, childrenEl);

		const mapObserver = new MutationObserver((mutations) => {
			if (hasOwnMutations(mutations, mapEl)) gate();
		});
		observers.push(mapObserver);
		observeSubtree(mapObserver, mapEl);

		for (const behindElement of behindElements) {
			const behindObserver = new MutationObserver((mutations) => {
				// Ignore mutations that originate inside our own pipeline element.
				// Behind elements are, by definition, ancestors or siblings that
				// sit under the same canvas root — when they're ancestors of the
				// pipeline (e.g. the wrapping positioned container), subtree:true
				// would otherwise catch every write we make to our own DOM and
				// loop gate() indefinitely.
				if (hasExternalMutations(mutations, pipelineEl)) gate();
			});
			behindObservers.push(behindObserver);
			observeSubtree(behindObserver, behindElement);
		}

		async function execute() {
			if (disposed || !pipelineEl || !childrenEl || !mapEl || !rasterEl || !canvasEl) return;

			const currentSnapshot = domSnapshot.current;

			if (!currentSnapshot) return;

			const canvasRoot = canvasRootRef.current;

			if (!canvasRoot) return;

			const maskDefs = maskDefsRef.current;

			if (!maskDefs) return;

			const label = `pictel:CompositeEffect(${id})`;

			try {
				for (const obs of observers) obs.disconnect();

				// Drop stale behind observers (from a previous execute cycle or
				// from the initial setup) — they'll be rebuilt below after the
				// effect completes. Keeping them would grow the array unboundedly
				// across rerun cycles.
				for (const obs of behindObservers) obs.disconnect();

				behindObservers = [];

				performance.mark(`${label}:capture:start`);
				const selfPromise = captureChildren(childrenEl, captureDimensions);
				const behindPromise = captureBehind(
					childrenEl,
					canvasRoot,
					captureDimensions,
					currentSnapshot.stackingOrder,
					currentSnapshot.rects,
					isDisposed,
				);
				const mapPromise = maps.length > 0
					? captureChildren(mapEl, captureDimensions)
					: undefined;

				const [selfPixels, behindPixels, mapPixels] = await Promise.all([selfPromise, behindPromise, mapPromise]);
				performance.mark(`${label}:capture:end`);
				performance.measure(`${label}:capture`, `${label}:capture:start`, `${label}:capture:end`);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (disposed) return;

				performance.mark(`${label}:effect:start`);
				const rawResult = await effect(selfPixels, behindPixels, mapPixels);
				performance.mark(`${label}:effect:end`);
				performance.measure(`${label}:effect`, `${label}:effect:start`, `${label}:effect:end`);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (disposed) return;

				const { pixels, overflow } = normalizeResult(rawResult);

				drawToCanvas(canvasEl, pixels);

				const childrenRect = childrenEl.getBoundingClientRect();
				rasterEl.style.top = `-${String(overflow.top)}px`;
				rasterEl.style.left = `-${String(overflow.left)}px`;
				rasterEl.style.width = `${String(childrenRect.width + overflow.left + overflow.right)}px`;
				rasterEl.style.height = `${String(childrenRect.height + overflow.top + overflow.bottom)}px`;

				const sourceRect = childrenEl.getBoundingClientRect();
				const canvasRect = currentSnapshot.canvasRect;

				for (const behindElement of behindElements) {
					const sharedMask = ensureSharedMask(behindElement, maskDefs);
					const cutout = addCutout(sharedMask, sourceRect, canvasRect);

					cutoutsRef.current.push(cutout);
				}

				pipelineEl.removeAttribute("data-pictel-pending");
				childrenEl.style.visibility = "hidden";
				rasterEl.style.display = "";

				for (const obs of observers) {
					if (obs === contentObserver) observeSubtree(obs, childrenEl);
					else if (obs === mapObserver) observeSubtree(obs, mapEl);
				}

				for (const behindElement of behindElements) {
					const behindObserver = new MutationObserver((mutations) => {
						if (hasExternalMutations(mutations, pipelineEl)) gate();
					});
					behindObservers.push(behindObserver);
					observeSubtree(behindObserver, behindElement);
				}
			} catch (error: unknown) {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (disposed) return;

				observeSubtree(contentObserver, childrenEl);
				observeSubtree(mapObserver, mapEl);
				reportError(createPipelineError(id, error));
			}
		}

		function onResize() {
			gate();
		}

		pipelineEl.addEventListener("pictel:resize", onResize);

		// Initial gate check
		gate();

		return () => {
			disposed = true;

			pipelineEl.removeEventListener("pictel:resize", onResize);

			for (const obs of observers) {
				obs.disconnect();
			}

			for (const obs of behindObservers) {
				obs.disconnect();
			}

			behindObservers = [];
			clearImageListeners();
			cleanupCutouts();

			pipelineEl.setAttribute("data-pictel-pending", "true");
			childrenEl.style.visibility = "";
		};
	}, [id, effect, flatten, maps, domSnapshot, maskDefsRef, canvasRootRef, captureDimensions, reportError]);

	return (
		<div
			ref={pipelineRef}
			data-pictel-pipeline
			data-pictel-pending
			style={flatten ? { isolation: "isolate" } : undefined}
		>
			<div style={{ position: "relative", height: 0 }}>
				<div
					ref={rasterRef}
					style={{ position: "absolute" }}
				>
					<canvas ref={canvasElRef} style={{ width: "100%", height: "100%" }} />
				</div>
			</div>
			<div style={{ position: "relative", height: 0 }}>
				<div
					ref={mapRef}
					style={{ position: "absolute", left: "-10000px", pointerEvents: "none" }}
				>
					{maps}
				</div>
			</div>
			<div ref={childrenRef}>
				{content}
			</div>
		</div>
	);
}
