import { useLayoutEffect, useRef, type ReactNode } from "react";

interface OverflowProps {
	children: ReactNode;
}

/**
 * Reveals a wrapped pipeline's bleed at natural pixel ratio.
 *
 * By default a pipeline's canvas element fills the pipeline's content box
 * (children size) at `width: 100%; height: 100%`, so when an effect produces
 * bleed (Blur halo, drop shadow falloff, etc.) the canvas pixels are squished
 * into the content footprint. Overflow reads the pipeline's
 * `data-pictel-overflow-top/right/bottom/left` attributes and expands the
 * pipeline's raster wrapper (`[data-pictel-raster]`) outside the pipeline
 * bounds so the canvas renders at its natural pixel ratio. The bleed extends
 * visibly outside the pipeline box.
 *
 * Only acts when the wrapped pipeline is not pending; during pending/initial
 * state the pipeline renders plain. Composes with an outer `overflow: hidden`
 * wrapper (see `Clip`) to crop the bleed back to content size.
 *
 * @param props
 * @category Pipeline
 */
export function Overflow({ children }: OverflowProps) {
	const wrapperRef = useRef<HTMLDivElement | null>(null);

	useLayoutEffect(() => {
		const wrapperEl = wrapperRef.current;

		if (!wrapperEl) return;

		const pipelineEl = wrapperEl.querySelector<HTMLElement>("[data-pictel-pipeline]");

		if (!pipelineEl) return;

		const rasterEl = pipelineEl.querySelector<HTMLElement>(":scope > [data-pictel-raster]");

		if (!rasterEl) return;

		function clearStyles(): void {
			if (!rasterEl) return;

			rasterEl.style.top = "";
			rasterEl.style.left = "";
			rasterEl.style.width = "";
			rasterEl.style.height = "";
		}

		function apply(): void {
			if (!pipelineEl || !rasterEl) return;

			// During pending (or initial mount before first resolve) do nothing —
			// the pipeline renders plain. Overflow attrs may be stale or absent.
			if (pipelineEl.getAttribute("data-pictel-pending") === "true") {
				clearStyles();

				return;
			}

			const top = Number(pipelineEl.dataset.pictelOverflowTop ?? "0");
			const right = Number(pipelineEl.dataset.pictelOverflowRight ?? "0");
			const bottom = Number(pipelineEl.dataset.pictelOverflowBottom ?? "0");
			const left = Number(pipelineEl.dataset.pictelOverflowLeft ?? "0");

			rasterEl.style.top = `-${String(top)}px`;
			rasterEl.style.left = `-${String(left)}px`;
			rasterEl.style.width = `calc(100% + ${String(left + right)}px)`;
			rasterEl.style.height = `calc(100% + ${String(top + bottom)}px)`;
		}

		apply();

		const observer = new MutationObserver(() => {
			apply();
		});
		observer.observe(pipelineEl, {
			attributes: true,
			attributeFilter: [
				"data-pictel-pending",
				"data-pictel-overflow-top",
				"data-pictel-overflow-right",
				"data-pictel-overflow-bottom",
				"data-pictel-overflow-left",
			],
		});

		return () => {
			observer.disconnect();
			clearStyles();
		};
	}, []);

	return <div ref={wrapperRef}>{children}</div>;
}
