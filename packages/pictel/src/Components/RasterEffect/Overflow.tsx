import { useLayoutEffect, useRef, type ReactNode } from "react";

interface OverflowProps {
	children: ReactNode;
}

/**
 * Lets a wrapped effect's bleed render outside the content footprint instead of
 * squishing into it. Use around a `Blur`, `DropShadow`, or any effect with halos
 * or falloff when you want the soft edges to extend past the children's box.
 *
 * Wrap a single raster effect. The bleed extends outward at natural pixel scale;
 * to crop it back to content size, wrap the result in `Clip` (or any
 * `overflow: hidden` container).
 *
 * - `children` — Required. A single raster effect whose output bleed should be revealed.
 *
 * @param props
 * @category RasterEffect
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

			const canvas = wrapperEl.querySelector<HTMLCanvasElement>(":scope > canvas[data-pictel-raster]");

			if (!canvas) {
				clear();

				return;
			}

			const top = Number(canvas.dataset.pictelOverflowTop ?? "0");
			const right = Number(canvas.dataset.pictelOverflowRight ?? "0");
			const bottom = Number(canvas.dataset.pictelOverflowBottom ?? "0");
			const left = Number(canvas.dataset.pictelOverflowLeft ?? "0");

			// Read backing-buffer attrs, not canvas.style.width — style reads feed our own writes back through the loop.
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

		const observerOptions: MutationObserverInit = {
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
		};

		const observer = new MutationObserver(() => {
			observer.disconnect();
			apply();
			observer.observe(wrapperEl, observerOptions);
		});

		apply();
		observer.observe(wrapperEl, observerOptions);

		return () => {
			observer.disconnect();
			clear();
		};
	}, []);

	return <div ref={wrapperRef}>{children}</div>;
}
