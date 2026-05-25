import { useLayoutEffect, useRef, type ReactNode } from "react";

interface OverflowProps {
	children: ReactNode;
}

/**
 * Reveals a wrapped pipeline's bleed at natural pixel ratio.
 *
 * By default a Pipeline's output canvas renders inline at the dimensions
 * children measured at (`cssW × cssH`) with a backing buffer that may be
 * larger when the effect produced bleed (Blur halo, drop shadow falloff,
 * etc.). Bleed pixels are squished into the content footprint by default.
 * Overflow finds the wrapped pipeline's
 * `[data-pictel-raster]` canvas, reads its
 * `data-pictel-overflow-{top,right,bottom,left}` data attributes, and
 * applies absolute positioning to the canvas — expanded by the overflow
 * sum on each axis and shifted by negative top/left — so the canvas
 * renders at its natural pixel ratio, visibly extending outside the
 * wrapper. Compose with an outer `overflow: hidden` wrapper (see `Clip`)
 * to crop the bleed back to content size.
 *
 * Only acts when the wrapped pipeline has resolved (i.e. its raster canvas
 * exists in the DOM). During pending the pipeline renders its children
 * inline; Overflow waits for the canvas to mount before applying styles,
 * watching the wrapper's subtree for the canvas's appearance/dimension
 * changes.
 *
 * @param props
 * @category Pipeline
 */
export function Overflow({ children }: OverflowProps) {
	const wrapperRef = useRef<HTMLDivElement | null>(null);

	useLayoutEffect(() => {
		const wrapperEl = wrapperRef.current;

		if (!wrapperEl) return;

		function clear(): void {
			if (!wrapperEl) return;

			wrapperEl.style.position = "";
			wrapperEl.style.width = "";
			wrapperEl.style.height = "";
			wrapperEl.style.display = "";
		}

		function apply(): void {
			if (!wrapperEl) return;

			const canvas = wrapperEl.querySelector<HTMLCanvasElement>("canvas[data-pictel-raster]");

			if (!canvas) {
				clear();

				return;
			}

			const top = Number(canvas.dataset.pictelOverflowTop ?? "0");
			const right = Number(canvas.dataset.pictelOverflowRight ?? "0");
			const bottom = Number(canvas.dataset.pictelOverflowBottom ?? "0");
			const left = Number(canvas.dataset.pictelOverflowLeft ?? "0");

			// Content (CSS) dimensions = backing buffer minus the overflow margins.
			// Reading canvas.width/height (intrinsic backing-buffer attributes) is
			// stable across re-applies; reading canvas.style.width risks feeding
			// our own previous write back through the loop.
			const cssW = canvas.width - left - right;
			const cssH = canvas.height - top - bottom;

			if (cssW <= 0 && cssH <= 0) {
				clear();

				return;
			}

			wrapperEl.style.position = "relative";
			wrapperEl.style.display = "inline-block";
			wrapperEl.style.width = `${String(cssW)}px`;
			wrapperEl.style.height = `${String(cssH)}px`;

			canvas.style.position = "absolute";
			canvas.style.top = `-${String(top)}px`;
			canvas.style.left = `-${String(left)}px`;
			canvas.style.width = `${String(cssW + left + right)}px`;
			canvas.style.height = `${String(cssH + top + bottom)}px`;
		}

		apply();

		const observer = new MutationObserver(() => {
			apply();
		});
		observer.observe(wrapperEl, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: [
				"data-pictel-overflow-top",
				"data-pictel-overflow-right",
				"data-pictel-overflow-bottom",
				"data-pictel-overflow-left",
				"style",
				"width",
				"height",
			],
		});

		return () => {
			observer.disconnect();
			clear();
		};
	}, []);

	return <div ref={wrapperRef}>{children}</div>;
}
