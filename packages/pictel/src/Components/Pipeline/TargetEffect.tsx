import { useId, useLayoutEffect, useMemo, useRef, type ComponentProps, type ReactNode } from "react";
import { useCanvasContext } from "../../context/canvas";
import { captureChildren } from "./utils/capture";
import { createPipelineError } from "../../utils/errors";
import { observeSubtree } from "../../utils/observe";
import { drawToCanvas, normalizeResult, type EffectResult } from "../utils/raster";
import { getOwnUnloadedImages, hasOwnMutations } from "./utils/scope";
import { checkStackingEscape } from "./utils/stacking-check";
import { separateChildren } from "./utils/separate-children";

export type TargetEffectCallback = (children: ImageData, map?: ImageData) => ImageData | EffectResult | Promise<ImageData | EffectResult>;

interface TargetEffectProps extends ComponentProps<"div"> {
	/** Pixel callback receiving children pixels and optional map pixels. Returns processed ImageData. */
	effect: TargetEffectCallback;
	flatten?: boolean;
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
export function TargetEffect({ effect, flatten, children, style, ...rest }: TargetEffectProps) {
	const id = useId();
	const pipelineRef = useRef<HTMLDivElement>(null);
	const childrenRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<HTMLDivElement>(null);
	const rasterRef = useRef<HTMLDivElement>(null);
	const canvasElRef = useRef<HTMLCanvasElement>(null);

	const { domSnapshot, captureDimensions, reportError } = useCanvasContext();
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
		const observers: Array<MutationObserver> = [];
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
			pipelineEl.setAttribute("data-pictel-pending", "true");
			childrenEl.style.visibility = "";
			rasterEl.style.display = "none";

			// Check for pending nested effects
			if (childrenEl.querySelector("[data-pictel-pending]") !== null) return;

			if (mapEl.querySelector("[data-pictel-pending]") !== null) return;

			// Check for unloaded images (scoped to our subtree)
			const unloaded = [
				...getOwnUnloadedImages(childrenEl),
				...getOwnUnloadedImages(mapEl),
			];

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
			const snapshot = domSnapshot.current;

			if (snapshot && !flatten) {
				const escaped = checkStackingEscape(childrenEl, snapshot.stackingOrder);

				if (escaped) {
					reportError(
						createPipelineError(
							id,
							new Error(
								`TargetEffect child escapes stacking context. Element "${escaped.tagName.toLowerCase()}" appears before its TargetEffect parent in the stacking order. Add the "flatten" prop to the TargetEffect or fix the child's z-index.`,
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

		async function execute() {
			if (disposed || !pipelineEl || !childrenEl || !mapEl || !rasterEl || !canvasEl) return;

			const label = `pictel:TargetEffect(${id})`;

			try {
				for (const obs of observers) obs.disconnect();

				performance.mark(`${label}:capture:start`);
				const contentPromise = captureChildren(childrenEl, captureDimensions);
				const mapPromise = maps.length > 0
					? captureChildren(mapEl, captureDimensions)
					: undefined;

				const [contentPixels, mapPixels] = await Promise.all([contentPromise, mapPromise]);
				performance.mark(`${label}:capture:end`);
				performance.measure(`${label}:capture`, `${label}:capture:start`, `${label}:capture:end`);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (disposed) return;

				performance.mark(`${label}:effect:start`);
				const rawResult = await effect(contentPixels, mapPixels);
				performance.mark(`${label}:effect:end`);
				performance.measure(`${label}:effect`, `${label}:effect:start`, `${label}:effect:end`);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (disposed) return;

				const { pixels, overflow } = normalizeResult(rawResult);

				drawToCanvas(canvasEl, pixels);

				const childrenRect = childrenEl.getBoundingClientRect();
				rasterEl.style.top = `-${String(childrenRect.height + overflow.top)}px`;
				rasterEl.style.left = `-${String(overflow.left)}px`;
				rasterEl.style.width = `${String(childrenRect.width + overflow.left + overflow.right)}px`;
				rasterEl.style.height = `${String(childrenRect.height + overflow.top + overflow.bottom)}px`;

				pipelineEl.removeAttribute("data-pictel-pending");
				childrenEl.style.visibility = "hidden";
				rasterEl.style.display = "";

				for (const obs of observers) {
					observeSubtree(obs, obs === contentObserver ? childrenEl : mapEl);
				}
			} catch (error: unknown) {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (disposed) return;

				for (const obs of observers) {
					observeSubtree(obs, obs === contentObserver ? childrenEl : mapEl);
				}

				reportError(createPipelineError(id, error));
			}
		}

		// Initial gate check
		gate();

		return () => {
			disposed = true;

			for (const obs of observers) obs.disconnect();

			clearImageListeners();
			pipelineEl.setAttribute("data-pictel-pending", "true");
			childrenEl.style.visibility = "";
		};
	}, [id, effect, flatten, maps, domSnapshot, captureDimensions, reportError]);

	return (
		<div
			ref={pipelineRef}
			data-pictel-pipeline
			data-pictel-pending
			style={flatten ? { ...style, isolation: "isolate" } : style}
			{...rest}
		>
			<div ref={childrenRef}>
				{content}
			</div>
			<div style={{ position: "relative", height: 0 }}>
				<div
					ref={mapRef}
					style={{ position: "absolute", left: "-10000px", pointerEvents: "none" }}
				>
					{maps}
				</div>
			</div>
			<div style={{ position: "relative", height: 0 }}>
				<div
					ref={rasterRef}
					style={{ position: "absolute" }}
				>
					<canvas ref={canvasElRef} style={{ width: "100%", height: "100%" }} />
				</div>
			</div>
		</div>
	);
}
