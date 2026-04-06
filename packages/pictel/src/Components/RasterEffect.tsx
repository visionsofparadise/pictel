import { useId, useLayoutEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { useCanvasContext } from "../context/canvas";
import { captureChildren } from "../pipeline/capture";
import { createPipelineError } from "../pipeline/errors";
import { drawToCanvas } from "../pipeline/raster";
import { checkStackingEscape } from "../pipeline/stacking-check";

export type RasterEffectCallback = (children: ImageData) => ImageData | Promise<ImageData>;

type RasterEffectProps = {
	effect: RasterEffectCallback;
	flatten?: boolean;
	children: ReactNode;
} & ComponentPropsWithoutRef<"div">;

export function RasterEffect({ effect, flatten, children, style, ...rest }: RasterEffectProps) {
	const userDisplay = style?.display ?? "";

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

		rasterEl.style.display = "none";

		let disposed = false;

		const observer = new MutationObserver(() => {
			if (disposed) return;

			childrenEl.setAttribute("data-pictel-pending", "true");
			childrenEl.style.display = userDisplay;
			rasterEl.style.display = "none";

			void Promise.resolve().then(() => execute(childrenEl));
		});

		observer.observe(observeEl, {
			childList: true,
			attributes: true,
			subtree: true,
			characterData: true,
		});

		async function execute(target: HTMLElement) {
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
								`RasterEffect child escapes stacking context. Element "${escaped.tagName.toLowerCase()}" appears before its RasterEffect parent in the stacking order. Add the "flatten" prop to the RasterEffect or fix the child's z-index.`,
							),
						),
					);

					return;
				}
			}

			try {
				const childPixels = await captureChildren(target, captureDimensions, cacheRef.current);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (disposed) return;

				const resultData = await effect(childPixels);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (disposed) return;

				drawToCanvas(canvasEl, resultData);

				target.removeAttribute("data-pictel-pending");
				target.style.display = "none";
				rasterEl.style.display = userDisplay;
			} catch (error: unknown) {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (disposed) return;

				reportError(createPipelineError(id, error));
			}
		}

		void Promise.resolve().then(() => execute(childrenEl));

		return () => {
			disposed = true;
			observer.disconnect();
			childrenEl.removeAttribute("data-pictel-pending");
		};
	}, [id, effect, flatten, userDisplay, domSnapshot, captureDimensions, reportError]);

	return (
		<>
			<div
				ref={childrenRef}
				data-pictel-pending
				style={flatten ? { ...style, isolation: "isolate" } : style}
				{...rest}
			>
				<div
					ref={observeRef}
					style={{ display: "contents" }}
				>
					{children}
				</div>
			</div>
			<div
				ref={rasterRef}
				style={style}
				{...rest}
			>
				<canvas ref={canvasElRef} style={{ width: "100%", height: "100%" }} />
			</div>
		</>
	);
}
