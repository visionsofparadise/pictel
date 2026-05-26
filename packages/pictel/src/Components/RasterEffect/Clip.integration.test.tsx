import { describe, expect, test } from "vitest";
import { Canvas, Clip } from "../../index";
import { Blur } from "@pictel/effects";
import { renderCanvas } from "../utils/render-canvas";
import { solidImage } from "../utils/test-images";
import { waitForRasterEffect } from "../utils/wait-for-raster-effect";

/**
 * Geometric behavior of the Clip + Overflow design. A Blur radius=10 over
 * 100x100 content paints a 120x120 backing canvas (10px bleed each side).
 * The RasterEffect renders the canvas inline at the children-measured CSS
 * dimensions (100x100), so bleed pixels are squished into the content
 * footprint by default. Overflow finds the `[data-pictel-raster]` canvas,
 * absolutely positions it, expands it to 120x120, and offsets it by -10
 * top/left so the canvas renders at its natural 1:1 pixel ratio extending
 * outside its layout box. Clip wraps Overflow in an `overflow: hidden`
 * container sized to the content (100x100) so the natural-ratio bleed is
 * cropped at the content edges.
 */
describe.sequential("Clip component", () => {
	test("without Clip, canvas backs at bleed dims but CSS sizes to content", async () => {
		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
				<Blur radius={10}>
					<img
						src={solidImage("#ff0000", 100, 100)}
						style={{ display: "block" }}
					/>
				</Blur>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(handle.container);

			const canvas = handle.container.querySelector<HTMLCanvasElement>("canvas[data-pictel-raster]");
			if (!canvas) throw new Error("no output canvas found");

			expect(canvas.width).toBe(120);
			expect(canvas.height).toBe(120);

			const canvasRect = canvas.getBoundingClientRect();
			expect(Math.round(canvasRect.width)).toBe(100);
			expect(Math.round(canvasRect.height)).toBe(100);
		} finally {
			handle.cleanup();
		}
	});

	test("with Clip, outer is content-size; canvas is expanded with negative offset", async () => {
		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
				<Clip>
					<Blur radius={10}>
						<img
							src={solidImage("#ff0000", 100, 100)}
							style={{ display: "block" }}
						/>
					</Blur>
				</Clip>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(handle.container);

			const canvas = handle.container.querySelector<HTMLCanvasElement>("canvas[data-pictel-raster]");
			if (!canvas) throw new Error("no output canvas found");

			expect(canvas.width).toBe(120);
			expect(canvas.height).toBe(120);

			const overflowWrapper = canvas.parentElement;
			if (!overflowWrapper) throw new Error("no Overflow wrapper found");
			const clipOuter = overflowWrapper.parentElement;
			if (!clipOuter) throw new Error("no Clip outer found");

			const clipRect = clipOuter.getBoundingClientRect();
			expect(Math.round(clipRect.width)).toBe(100);
			expect(Math.round(clipRect.height)).toBe(100);

			const canvasRect = canvas.getBoundingClientRect();
			expect(Math.round(canvasRect.width)).toBe(120);
			expect(Math.round(canvasRect.height)).toBe(120);

			const overflowRect = overflowWrapper.getBoundingClientRect();
			expect(Math.round(canvasRect.left - overflowRect.left)).toBe(-10);
			expect(Math.round(canvasRect.top - overflowRect.top)).toBe(-10);
		} finally {
			handle.cleanup();
		}
	});
});
