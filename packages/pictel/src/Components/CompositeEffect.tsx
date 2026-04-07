import { useId, useLayoutEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { useCanvasContext } from "../context/canvas";
import { captureBehind, captureContentGroup, captureMapGroup, partitionChildren } from "../pipeline/capture";
import { createPipelineError } from "../pipeline/errors";
import { addCutout, ensureSharedMask, removeCutouts } from "../pipeline/masking";
import { observeSubtree } from "../pipeline/observe";
import { drawToCanvas, normalizeResult, type EffectResult } from "../pipeline/raster";
import { getElementsBehind } from "../pipeline/stacking";
import { checkStackingEscape } from "../pipeline/stacking-check";

export type CompositeEffectCallback = (self: ImageData, behind: ImageData, map?: ImageData) => ImageData | EffectResult | Promise<ImageData | EffectResult>;

type CompositeEffectProps = {
	effect: CompositeEffectCallback;
	flatten?: boolean;
	children: ReactNode;
} & ComponentPropsWithoutRef<"div">;

export function CompositeEffect({ effect, flatten, children, style, ...rest }: CompositeEffectProps) {
	const id = useId();
	const childrenRef = useRef<HTMLDivElement>(null);
	const observeRef = useRef<HTMLDivElement>(null);
	const rasterRef = useRef<HTMLDivElement>(null);
	const canvasElRef = useRef<HTMLCanvasElement>(null);
	const cacheRef = useRef(new Map<string, ImageData>());
	const cutoutsRef = useRef<Array<SVGRectElement>>([]);

	const { domSnapshot, maskDefs: maskDefsRef, canvasRoot: canvasRootRef, captureDimensions, reportError } = useCanvasContext();

	useLayoutEffect(() => {
		const childrenEl = childrenRef.current;
		const observeEl = observeRef.current;
		const rasterEl = rasterRef.current;
		const canvasEl = canvasElRef.current;

		if (!childrenEl || !observeEl || !rasterEl || !canvasEl) return;

		const observe = observeEl;

		rasterEl.style.display = "none";

		let disposed = false;
		const observers: Array<MutationObserver> = [];

		function cleanupCutouts() {
			removeCutouts(cutoutsRef.current);
			cutoutsRef.current = [];
		}

		// Read snapshot to find behind elements
		const snapshot = domSnapshot.current;
		const behindElements = snapshot ? getElementsBehind(childrenEl, snapshot.stackingOrder, snapshot.rects) : [];

		function onMutation() {
			if (disposed || !childrenEl || !rasterEl) return;

			cleanupCutouts();

			childrenEl.setAttribute("data-pictel-pending", "true");
			childrenEl.style.visibility = "";
			rasterEl.style.display = "none";

			void Promise.resolve().then(() => execute(childrenEl, observe, behindElements));
		}

		// Children subtree observer
		const childrenObserver = new MutationObserver(onMutation);
		observers.push(childrenObserver);
		observeSubtree(childrenObserver, observeEl);

		// Behind element observers
		for (const behindElement of behindElements) {
			const behindObserver = new MutationObserver(onMutation);
			observers.push(behindObserver);
			observeSubtree(behindObserver, behindElement);
		}

		async function execute(target: HTMLElement, observe: HTMLElement, behinds: Array<HTMLElement>) {
			if (disposed || !rasterEl || !canvasEl) return;

			const hasPendingChild = target.querySelector("[data-pictel-pending]") !== null;

			if (hasPendingChild) return;

			const hasPendingBehind = behinds.some((behind) => behind.getAttribute("data-pictel-pending") === "true" || behind.querySelector("[data-pictel-pending]") !== null);

			if (hasPendingBehind) return;

			const currentSnapshot = domSnapshot.current;

			if (!currentSnapshot) return;

			const canvasRoot = canvasRootRef.current;

			if (!canvasRoot) return;

			const maskDefs = maskDefsRef.current;

			if (!maskDefs) return;

			// Stacking context escape check
			if (!flatten) {
				const escaped = checkStackingEscape(target, currentSnapshot.stackingOrder);

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

			try {
				const { mapElements, contentElements } = partitionChildren(observe);

				const [selfPixels, behindPixels, mapPixels] = await Promise.all([
					captureContentGroup(observe, mapElements, captureDimensions, cacheRef.current),
					captureBehind(target, canvasRoot, captureDimensions, cacheRef.current, currentSnapshot.stackingOrder, currentSnapshot.rects),
					mapElements.length > 0 ? captureMapGroup(observe, contentElements, captureDimensions, cacheRef.current) : Promise.resolve(undefined),
				]);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (disposed) return;

				const rawResult = await effect(selfPixels, behindPixels, mapPixels);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (disposed) return;

				const { pixels, overflow } = normalizeResult(rawResult);

				drawToCanvas(canvasEl, pixels);

				const childrenRect = target.getBoundingClientRect();
				rasterEl.style.top = `-${String(childrenRect.height + overflow.top)}px`;
				rasterEl.style.left = `-${String(overflow.left)}px`;
				rasterEl.style.width = `${String(childrenRect.width + overflow.left + overflow.right)}px`;
				rasterEl.style.height = `${String(childrenRect.height + overflow.top + overflow.bottom)}px`;

				// Apply knockout cutouts to behind elements' shared masks
				const sourceRect = target.getBoundingClientRect();
				const canvasRect = currentSnapshot.canvasRect;

				for (const behindElement of behinds) {
					const sharedMask = ensureSharedMask(behindElement, maskDefs);
					const cutout = addCutout(sharedMask, sourceRect, canvasRect);

					cutoutsRef.current.push(cutout);
				}

				target.removeAttribute("data-pictel-pending");
				target.style.visibility = "hidden";
				rasterEl.style.display = "";
			} catch (error: unknown) {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (disposed) return;

				reportError(createPipelineError(id, error));
			}
		}

		void Promise.resolve().then(() => execute(childrenEl, observe, behindElements));

		return () => {
			disposed = true;

			for (const observer of observers) {
				observer.disconnect();
			}

			cleanupCutouts();
			childrenEl.removeAttribute("data-pictel-pending");
		};
	}, [id, effect, flatten, domSnapshot, maskDefsRef, canvasRootRef, captureDimensions, reportError]);

	return (
		<div
			style={flatten ? { ...style, isolation: "isolate" } : style}
			{...rest}
		>
			<div
				ref={childrenRef}
				data-pictel-pending
			>
				<div
					ref={observeRef}
					style={{ display: "contents" }}
				>
					{children}
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
