import { useId, useLayoutEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { useCanvasContext } from "../context/canvas";
import { captureContentGroup, captureMapGroup, partitionChildren } from "../pipeline/capture";
import { createPipelineError } from "../pipeline/errors";
import { observeSubtree } from "../pipeline/observe";
import { drawToCanvas, normalizeResult, type EffectResult } from "../pipeline/raster";
import { checkStackingEscape } from "../pipeline/stacking-check";

export type TargetEffectCallback = (children: ImageData, map?: ImageData) => ImageData | EffectResult | Promise<ImageData | EffectResult>;

type TargetEffectProps = {
	effect: TargetEffectCallback;
	flatten?: boolean;
	children: ReactNode;
} & ComponentPropsWithoutRef<"div">;

export function TargetEffect({ effect, flatten, children, style, ...rest }: TargetEffectProps) {
	const id = useId();
	const childrenRef = useRef<HTMLDivElement>(null);
	const observeRef = useRef<HTMLDivElement>(null);
	const rasterRef = useRef<HTMLDivElement>(null);
	const canvasElRef = useRef<HTMLCanvasElement>(null);
	const cacheRef = useRef(new Map<string, ImageData>());

	const { domSnapshot, captureDimensions, reportError } = useCanvasContext();

	useLayoutEffect(() => {
		const childrenEl = childrenRef.current;
		const observeEl = observeRef.current;
		const rasterEl = rasterRef.current;
		const canvasEl = canvasElRef.current;

		if (!childrenEl || !observeEl || !rasterEl || !canvasEl) return;

		const observe = observeEl;

		rasterEl.style.display = "none";

		let disposed = false;

		const observer = new MutationObserver(() => {
			if (disposed) return;

			childrenEl.setAttribute("data-pictel-pending", "true");
			childrenEl.style.visibility = "";
			rasterEl.style.display = "none";

			void Promise.resolve().then(() => execute(childrenEl, observe));
		});

		observeSubtree(observer, observeEl);

		async function execute(target: HTMLElement, observe: HTMLElement) {
			if (disposed || !rasterEl || !canvasEl) return;

			const hasPending = target.querySelector("[data-pictel-pending]") !== null;

			if (hasPending) return;

			const snapshot = domSnapshot.current;

			if (snapshot && !flatten) {
				const escaped = checkStackingEscape(target, snapshot.stackingOrder);

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

			try {
				const { mapElements, contentElements } = partitionChildren(observe);

				const [contentPixels, mapPixels] = await Promise.all([
					captureContentGroup(observe, mapElements, captureDimensions, cacheRef.current),
					mapElements.length > 0 ? captureMapGroup(observe, contentElements, captureDimensions, cacheRef.current) : Promise.resolve(undefined),
				]);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (disposed) return;

				const rawResult = await effect(contentPixels, mapPixels);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (disposed) return;

				const { pixels, overflow } = normalizeResult(rawResult);

				drawToCanvas(canvasEl, pixels);

				const childrenRect = target.getBoundingClientRect();
				rasterEl.style.top = `-${String(childrenRect.height + overflow.top)}px`;
				rasterEl.style.left = `-${String(overflow.left)}px`;
				rasterEl.style.width = `${String(childrenRect.width + overflow.left + overflow.right)}px`;
				rasterEl.style.height = `${String(childrenRect.height + overflow.top + overflow.bottom)}px`;

				target.removeAttribute("data-pictel-pending");
				target.style.visibility = "hidden";
				rasterEl.style.display = "";
			} catch (error: unknown) {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (disposed) return;

				reportError(createPipelineError(id, error));
			}
		}

		void Promise.resolve().then(() => execute(childrenEl, observe));

		return () => {
			disposed = true;
			observer.disconnect();
			childrenEl.removeAttribute("data-pictel-pending");
		};
	}, [id, effect, flatten, domSnapshot, captureDimensions, reportError]);

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
