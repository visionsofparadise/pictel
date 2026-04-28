import { describe, expect, test } from "vitest";
import { Blur, Canvas, Clip } from "../../index";
import { renderCanvas } from "../utils/render-canvas";
import { solidImage } from "../utils/test-images";
import { waitForPipeline } from "../utils/wait-for-pipeline";

/**
 * Geometric behavior of the Clip + Overflow design. A Blur radius=10 over
 * 100x100 content paints a 120x120 canvas (10px bleed each side). The
 * pipeline div always stays at content size (100x100) — children-in-flow
 * drive its layout. The raster wrapper sits abs-positioned inside, filling
 * the pipeline at `100%/100%` by default (bleed squished into the content
 * footprint). Clip wraps with `overflow: hidden` + Overflow, which expands
 * the raster to 120x120 at -10,-10 so the image content maps 1:1 onto the
 * 100x100 clipped region and bleed is cropped.
 */
describe.sequential("Clip component", () => {
	test("without Clip, pipeline stays at content size; canvas CSS is squished to fit", async () => {
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
			await waitForPipeline(handle.container);

			const pipeline = handle.container.querySelector<HTMLElement>("[data-pictel-pipeline]");
			if (!pipeline) throw new Error("no pipeline div found");

			const canvas = pipeline.querySelector<HTMLCanvasElement>(":scope > [data-pictel-raster] > canvas");
			if (!canvas) throw new Error("no output canvas found");

			// Canvas pixel attributes include bleed (content + bleed).
			expect(canvas.width).toBe(120);
			expect(canvas.height).toBe(120);

			// Pipeline div is at content size — children-in-flow drive layout.
			const pipelineRect = pipeline.getBoundingClientRect();
			expect(Math.round(pipelineRect.width)).toBe(100);
			expect(Math.round(pipelineRect.height)).toBe(100);

			// Canvas CSS (display size) fills the pipeline — 120 pixels squished
			// into 100px of layout.
			const canvasRect = canvas.getBoundingClientRect();
			expect(Math.round(canvasRect.width)).toBe(100);
			expect(Math.round(canvasRect.height)).toBe(100);
		} finally {
			handle.cleanup();
		}
	});

	test("with Clip, outer is content-size; raster is expanded with negative offset", async () => {
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
			await waitForPipeline(handle.container);

			const pipeline = handle.container.querySelector<HTMLElement>("[data-pictel-pipeline]");
			if (!pipeline) throw new Error("no pipeline div found");

			const canvas = pipeline.querySelector<HTMLCanvasElement>(":scope > [data-pictel-raster] > canvas");
			if (!canvas) throw new Error("no output canvas found");

			// Canvas pixel attributes unchanged — bleed still painted.
			expect(canvas.width).toBe(120);
			expect(canvas.height).toBe(120);

			// Clip is: outer[overflow:hidden] > Overflow wrapper > pipeline.
			// Outer sizes to the pipeline (content size) because the pipeline
			// is in flow and abs-positioned bleed on the raster doesn't
			// contribute to layout.
			const overflowWrapper = pipeline.parentElement;
			const outer = overflowWrapper?.parentElement;
			if (!outer) throw new Error("could not find Clip outer element");

			const outerRect = outer.getBoundingClientRect();
			expect(Math.round(outerRect.width)).toBe(100);
			expect(Math.round(outerRect.height)).toBe(100);

			// Raster is abs-positioned inside the pipeline. Overflow expands
			// it to content + bleed and shifts by -bleed on each side.
			const raster = pipeline.querySelector<HTMLElement>(":scope > [data-pictel-raster]");
			if (!raster) throw new Error("no raster element found");

			const rasterRect = raster.getBoundingClientRect();
			expect(Math.round(rasterRect.width)).toBe(120);
			expect(Math.round(rasterRect.height)).toBe(120);

			// Raster shifted -10 from pipeline on each side.
			const pipelineRect = pipeline.getBoundingClientRect();
			expect(Math.round(rasterRect.left - pipelineRect.left)).toBe(-10);
			expect(Math.round(rasterRect.top - pipelineRect.top)).toBe(-10);
		} finally {
			handle.cleanup();
		}
	});
});
