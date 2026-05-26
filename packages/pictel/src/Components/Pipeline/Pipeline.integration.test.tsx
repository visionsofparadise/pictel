import { describe, expect, test } from "vitest";
import { StrictMode, useCallback } from "react";
import { Canvas, Invert, LinearGradient, Outline, Threshold } from "../../index";
import { Pipeline, type PipelineCallback } from "./Pipeline";
import { renderCanvas } from "../utils/render-canvas";
import { readPipelineOutput, readPixel } from "../utils/read-pipeline-output";
import { solidImage } from "../utils/test-images";
import { waitForPipeline } from "../utils/wait-for-pipeline";
import { applyInvert } from "../Effects/Invert";

// --- Helpers ---

/**
 * Locate the outermost Pipeline output canvas in `container`. A Pipeline
 * renders inline as `<div>{children}</div><canvas data-pictel-raster>`; an
 * outer Pipeline's children wrapper contains an inner Pipeline's nodes
 * (including the inner's own raster canvas). The outer's canvas is the one
 * whose previous-sibling wrapper element contains another
 * `[data-pictel-raster]` canvas in its subtree; if no such canvas exists
 * (single-Pipeline composition), the lone raster canvas IS the outer.
 */
function getOuterCanvas(container: HTMLElement): HTMLCanvasElement {
	const all = Array.from(
		container.querySelectorAll<HTMLCanvasElement>("canvas[data-pictel-raster]"),
	);

	if (all.length === 0) throw new Error("no canvas[data-pictel-raster] found in container");

	if (all.length === 1) return all[0]!;

	const outer = all.find((candidate) => {
		const prev = candidate.previousElementSibling;
		return prev instanceof HTMLElement && prev.querySelector("canvas[data-pictel-raster]") !== null;
	});

	if (!outer) throw new Error("could not determine outer raster canvas");

	return outer;
}

// --- Identity effect for testing ---

function identityEffect(pixels: ImageData): { pixels: ImageData } {
	return { pixels };
}

// --- Integration tests ---

describe.sequential("Pipeline integration", () => {
	test("children-only: effect receives target pixels and draws result", async () => {
		// Invert a solid red image through Pipeline directly to verify the full
		// children-only lifecycle: capture → callback → drawToCanvas → reveal.
		function InvertPipeline({ children }: { children: React.ReactNode }) {
			const effect = useCallback<PipelineCallback>((target) => {
				return { pixels: applyInvert(target, 1) };
			}, []);

			return <Pipeline effect={effect}>{children}</Pipeline>;
		}

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<InvertPipeline>
					<img src={solidImage("#ff0000", 64, 64)} />
				</InvertPipeline>
			</Canvas>,
		);

		try {
			await waitForPipeline(handle.container);
			const canvas = getOuterCanvas(handle.container);

			const pixels = readPipelineOutput(canvas);
			const [red, green, blue] = readPixel(pixels, 10, 10);

			// Inverted red (#ff0000) = #00ffff: red ≈ 0, green ≈ 255, blue ≈ 255.
			expect(red).toBeLessThanOrEqual(5);
			expect(green).toBeGreaterThanOrEqual(250);
			expect(blue).toBeGreaterThanOrEqual(250);
		} finally {
			handle.cleanup();
		}
	});

	test("with apply: outer waits for inner pipeline in apply, captures via fast path", async () => {
		// Outer Pipeline's `apply` contains an inner Pipeline (Invert).
		// The outer effect receives target (red) and apply (inverted red = cyan).
		// We assert the outer received non-trivial apply pixels.
		let capturedApply: ImageData | undefined;

		function BlendWithApply({ apply, children }: { apply: React.ReactNode; children: React.ReactNode }) {
			const effect = useCallback<PipelineCallback>((target, applyPixels) => {
				capturedApply = applyPixels;
				// Return target unchanged for simplicity.
				return { pixels: target };
			}, []);

			return <Pipeline effect={effect} apply={apply}>{children}</Pipeline>;
		}

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<BlendWithApply
					apply={
						<Invert>
							<img src={solidImage("#ff0000", 64, 64)} />
						</Invert>
					}
				>
					<img src={solidImage("#00ff00", 64, 64)} />
				</BlendWithApply>
			</Canvas>,
		);

		try {
			await waitForPipeline(handle.container);

			// Outer pipeline resolved — it captured the inner apply pipeline.
			expect(capturedApply).toBeDefined();

			// The apply pixels should be the inverted red (cyan): red≈0, green≈255, blue≈255.
			// Test a center pixel (32, 32).
			if (capturedApply) {
				const index = (32 * capturedApply.width + 32) * 4;
				const r = capturedApply.data[index] ?? 0;
				const g = capturedApply.data[index + 1] ?? 0;
				const b = capturedApply.data[index + 2] ?? 0;
				expect(r).toBeLessThanOrEqual(10);
				expect(g).toBeGreaterThanOrEqual(245);
				expect(b).toBeGreaterThanOrEqual(245);
			}
		} finally {
			handle.cleanup();
		}
	});

	test("with map: outer waits for inner pipeline in map, receives map pixels", async () => {
		// Outer Pipeline's `map` contains an inner Pipeline (Invert on white = black).
		// We assert the outer received map pixels.
		let capturedMap: ImageData | undefined;

		function EffectWithMap({ map, children }: { map: React.ReactNode; children: React.ReactNode }) {
			const effect = useCallback<PipelineCallback>((target, _apply, mapPixels) => {
				capturedMap = mapPixels;

				return { pixels: target };
			}, []);

			return <Pipeline effect={effect} map={map}>{children}</Pipeline>;
		}

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<EffectWithMap
					map={
						<Invert>
							<img src={solidImage("#ffffff", 64, 64)} />
						</Invert>
					}
				>
					<img src={solidImage("#ff0000", 64, 64)} />
				</EffectWithMap>
			</Canvas>,
		);

		try {
			await waitForPipeline(handle.container);

			expect(capturedMap).toBeDefined();

			// The map pixels should be inverted white = black: all channels ≈ 0.
			if (capturedMap) {
				const index = (32 * capturedMap.width + 32) * 4;
				const r = capturedMap.data[index] ?? 255;
				const g = capturedMap.data[index + 1] ?? 255;
				const b = capturedMap.data[index + 2] ?? 255;
				expect(r).toBeLessThanOrEqual(10);
				expect(g).toBeLessThanOrEqual(10);
				expect(b).toBeLessThanOrEqual(10);
			}
		} finally {
			handle.cleanup();
		}
	});

	test("two-pipeline chain via apply: pending gate waits for inner before capturing", async () => {
		// Verifies that the outer pipeline's gate correctly waits for the inner
		// pipeline's pending flag to clear before proceeding with capture.
		// We track call order: inner effect must complete before outer.
		const callOrder: Array<string> = [];

		function Inner({ children }: { children: React.ReactNode }) {
			const effect = useCallback<PipelineCallback>((target) => {
				callOrder.push("inner");

				return { pixels: target };
			}, []);

			return <Pipeline effect={effect}>{children}</Pipeline>;
		}

		function Outer({ apply, children }: { apply: React.ReactNode; children: React.ReactNode }) {
			const effect = useCallback<PipelineCallback>((target) => {
				callOrder.push("outer");

				return { pixels: target };
			}, []);

			return <Pipeline effect={effect} apply={apply}>{children}</Pipeline>;
		}

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<Outer
					apply={
						<Inner>
							<img src={solidImage("#ff0000", 64, 64)} />
						</Inner>
					}
				>
					<img src={solidImage("#00ff00", 64, 64)} />
				</Outer>
			</Canvas>,
		);

		try {
			await waitForPipeline(handle.container);

			// Inner must have resolved before outer ran.
			const innerIndex = callOrder.indexOf("inner");
			const outerIndex = callOrder.indexOf("outer");
			expect(innerIndex).toBeGreaterThanOrEqual(0);
			expect(outerIndex).toBeGreaterThanOrEqual(0);
			expect(innerIndex).toBeLessThan(outerIndex);
		} finally {
			handle.cleanup();
		}
	});

	test("StrictMode double-mount: resolves correctly after setup→cleanup→setup", async () => {
		// Mirrors the level 8 pattern from Canvas.integration.test.tsx.
		// Uses a simple children-only Pipeline in StrictMode.
		function InvertPipeline({ children }: { children: React.ReactNode }) {
			const effect = useCallback<PipelineCallback>((target) => {
				return { pixels: applyInvert(target, 1) };
			}, []);

			return <Pipeline effect={effect}>{children}</Pipeline>;
		}

		const handle = renderCanvas(
			<StrictMode>
				<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
					<InvertPipeline>
						<img src={solidImage("#ff0000", 64, 64)} />
					</InvertPipeline>
				</Canvas>
			</StrictMode>,
		);

		try {
			await waitForPipeline(handle.container);

			const outer = getOuterCanvas(handle.container);
			const pixels = readPipelineOutput(outer);
			const [red, green, blue] = readPixel(pixels, 10, 10);

			// Inverted red = cyan: red ≈ 0, green ≈ 255, blue ≈ 255.
			expect(red).toBeLessThanOrEqual(5);
			expect(green).toBeGreaterThanOrEqual(250);
			expect(blue).toBeGreaterThanOrEqual(250);
		} finally {
			handle.cleanup();
		}
	});

	test("pipeline layout stable after resolve — canvas at children-measured dims", async () => {
		// After resolve, children are visibility:hidden but still in flow.
		// The pipeline div must keep the same size as before resolve.
		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<Pipeline effect={identityEffect}>
					<img src={solidImage("#ff0000", 64, 64)} style={{ display: "block" }} />
				</Pipeline>
			</Canvas>,
		);

		try {
			await waitForPipeline(handle.container);

			const canvas = getOuterCanvas(handle.container);

			// Canvas has non-zero CSS dimensions driven by the children's measured
			// box at capture time.
			const rect = canvas.getBoundingClientRect();
			expect(rect.width).toBeGreaterThan(0);
			expect(rect.height).toBeGreaterThan(0);

			// Children wrapper is the canvas's previous sibling, with display:none
			// once snapshot is set so children stay mounted but un-laid-out.
			const childrenWrapper = canvas.previousElementSibling as HTMLElement | null;
			expect(childrenWrapper).not.toBeNull();
			expect(childrenWrapper?.style.display).toBe("none");

			// Canvas is in-flow at display: block (carries the pipeline's layout).
			expect(canvas.style.display).toBe("block");
		} finally {
			handle.cleanup();
		}
	});

	test("apply with chained effects: pending propagates through apply subtree", async () => {
		// The apply prop contains a two-effect chain: Outline > Threshold (Outline
		// is the inner pipeline; Threshold wraps it). The outer gate must wait for
		// both inner pipelines to resolve before capturing the apply subtree.
		//
		// Bug this catches: if the gate only checks direct [data-pictel-pending]
		// children of applyRef rather than all descendants, it fires while Outline
		// is still pending — the outer captures a transparent/zero-pixel apply
		// image and the chain produces incorrect output.
		let capturedApply: ImageData | undefined;

		function OuterWithChainedApply({
			apply,
			children,
		}: {
			apply: React.ReactNode;
			children: React.ReactNode;
		}) {
			const effect = useCallback<PipelineCallback>((target, applyPixels) => {
				capturedApply = applyPixels;

				return { pixels: target };
			}, []);

			return <Pipeline effect={effect} apply={apply}>{children}</Pipeline>;
		}

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<OuterWithChainedApply
					apply={
						// Outline a solid white image, then threshold it.
						// Threshold(Outline(white)) → solid white (white has uniform
						// luminance, so Outline produces white, Threshold above 0.5
						// keeps it white). The key assertion is that the apply image
						// has non-zero alpha (non-transparent), proving the chain
						// resolved before the outer captured it.
						<Threshold threshold={128}>
							<Outline>
								<img src={solidImage("#ffffff", 64, 64)} style={{ display: "block" }} />
							</Outline>
						</Threshold>
					}
				>
					<img src={solidImage("#ff0000", 64, 64)} style={{ display: "block" }} />
				</OuterWithChainedApply>
			</Canvas>,
		);

		try {
			await waitForPipeline(handle.container);

			expect(capturedApply).toBeDefined();

			if (capturedApply) {
				// If the chain resolved correctly, at least one pixel must be
				// non-transparent. A premature capture would have zero alpha everywhere
				// because snapdom captures a visibility:hidden subtree as transparent.
				const anyNonTransparent = Array.from(capturedApply.data).some(
					(_, i) => i % 4 === 3 && capturedApply!.data[i]! > 0,
				);
				expect(anyNonTransparent).toBe(true);
			}
		} finally {
			handle.cleanup();
		}
	});

	test("error in effect callback: pending releases and error is reported via context", async () => {
		// When the effect callback throws, the pipeline must still release
		// data-pictel-pending (so waitForPipeline doesn't hang) and report the
		// error to the Canvas's reportError handler. The raster canvas must NOT
		// be revealed (no output drawn on error).
		//
		// Bug this catches: if the error path in execute() doesn't clear the
		// registry pending flag and notify, the pipeline stalls with pending
		// forever and the Canvas loading overlay never clears.
		const reportedErrors: Array<{ message: string }> = [];

		function ThrowingPipeline({ children }: { children: React.ReactNode }) {
			const effect = useCallback<PipelineCallback>(() => {
				throw new Error("intentional test error");
			}, []);

			return <Pipeline effect={effect}>{children}</Pipeline>;
		}

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<ThrowingPipeline>
					<img src={solidImage("#ff0000", 64, 64)} />
				</ThrowingPipeline>
			</Canvas>,
		);

		try {
			// waitForPipeline resolves when the Canvas root's [data-pictel-pending]
			// is cleared. If the error path doesn't reset pending, this times out.
			await waitForPipeline(handle.container);

			// On error, no snapshot is set — so no [data-pictel-raster] canvas
			// renders. The effect threw before setSnapshot ran.
			const canvas = handle.container.querySelector<HTMLElement>("canvas[data-pictel-raster]");
			expect(canvas).toBeNull();

			// ErrorChip is rendered inside Canvas when errors accumulate.
			// It returns null when there are no errors, so its presence proves
			// the error was reported via reportError → Canvas state → ErrorChip render.
			// The ErrorChip only renders a DOM element when errors.length > 0.
			const errorChip = handle.container.querySelector("[data-pictel-canvas] svg");
			expect(errorChip).not.toBeNull();

			void reportedErrors;
		} finally {
			handle.cleanup();
		}
	});

	test("StrictMode with apply and map both populated: resolves correctly after double-mount", async () => {
		// Verifies that StrictMode's setup→cleanup→setup cycle (which fires
		// useLayoutEffect twice) doesn't strand observers or corrupt state when
		// both apply AND map offscreen subtrees are active simultaneously.
		//
		// Bug this catches: cleanup in the first mount's return() must disconnect
		// ALL three observers (content, apply, map, size). If applyObserver or
		// mapObserver is not disconnected on first cleanup, they fire gate() on
		// the second mount's DOM mutations and race against the second mount's
		// fresh gate, potentially double-running execute and corrupting pending
		// refcounts.
		let capturedApply: ImageData | undefined;
		let capturedMap: ImageData | undefined;

		function PipelineWithApplyAndMap({
			apply,
			map,
			children,
		}: {
			apply: React.ReactNode;
			map: React.ReactNode;
			children: React.ReactNode;
		}) {
			const effect = useCallback<PipelineCallback>((target, applyPixels, mapPixels) => {
				capturedApply = applyPixels;
				capturedMap = mapPixels;

				return { pixels: target };
			}, []);

			return (
				<Pipeline effect={effect} apply={apply} map={map}>
					{children}
				</Pipeline>
			);
		}

		const handle = renderCanvas(
			<StrictMode>
				<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
					<PipelineWithApplyAndMap
						apply={<img src={solidImage("#00ff00", 64, 64)} />}
						map={<img src={solidImage("#ffffff", 64, 64)} />}
					>
						<img src={solidImage("#ff0000", 64, 64)} />
					</PipelineWithApplyAndMap>
				</Canvas>
			</StrictMode>,
		);

		try {
			await waitForPipeline(handle.container);

			// Both apply and map must have been captured (non-undefined) and
			// have at least one non-transparent pixel — proving neither offscreen
			// subtree was captured as a zero-area or aborted result.
			expect(capturedApply).toBeDefined();
			expect(capturedMap).toBeDefined();

			if (capturedApply) {
				const idx = (32 * capturedApply.width + 32) * 4;
				// Apply is solid green (#00ff00): green channel should be high.
				expect(capturedApply.data[idx + 1]).toBeGreaterThanOrEqual(200);
			}

			if (capturedMap) {
				const idx = (32 * capturedMap.width + 32) * 4;
				// Map is solid white: all channels should be high.
				expect(capturedMap.data[idx]).toBeGreaterThanOrEqual(200);
			}
		} finally {
			handle.cleanup();
		}
	});

	test("apply/map subtrees do not inherit CSS from JSX-location ancestors", async () => {
		// After Phase 2, apply/map portal into the Canvas-level offscreen host
		// instead of rendering inside the pipeline div. A composition that places
		// a Pipeline inside a `color: red` wrapper must not leak that color into
		// the apply/map subtree — those subtrees inherit only from the offscreen
		// host (a sibling of the canvas root under the Canvas component).
		const observedColors: { apply: string | null; map: string | null } = {
			apply: null,
			map: null,
		};

		function ColorProbe({ kind }: { kind: "apply" | "map" }) {
			return (
				<div
					ref={(node) => {
						if (node === null) return;

						observedColors[kind] = window.getComputedStyle(node).color;
					}}
					style={{ width: 64, height: 64 }}
				/>
			);
		}

		function CapturingPipeline({
			apply,
			map,
			children,
		}: {
			apply: React.ReactNode;
			map: React.ReactNode;
			children: React.ReactNode;
		}) {
			const effect = useCallback<PipelineCallback>((target) => ({ pixels: target }), []);

			return (
				<Pipeline effect={effect} apply={apply} map={map}>
					{children}
				</Pipeline>
			);
		}

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<div style={{ color: "rgb(255, 0, 0)" }}>
					<CapturingPipeline
						apply={<ColorProbe kind="apply" />}
						map={<ColorProbe kind="map" />}
					>
						<img src={solidImage("#0000ff", 64, 64)} />
					</CapturingPipeline>
				</div>
			</Canvas>,
		);

		try {
			await waitForPipeline(handle.container);

			// The wrapping div sets color: red. If apply/map inherited from their
			// JSX location they'd see "rgb(255, 0, 0)". The offscreen host is a
			// sibling of the canvas root, outside the colored wrapper, so neither
			// probe should see red.
			expect(observedColors.apply).not.toBeNull();
			expect(observedColors.map).not.toBeNull();
			expect(observedColors.apply).not.toBe("rgb(255, 0, 0)");
			expect(observedColors.map).not.toBe("rgb(255, 0, 0)");
		} finally {
			handle.cleanup();
		}
	});

	test("outer Pipeline with map waits for nested RasterSource cascade at non-square dims", async () => {
		// Regression: an outer Pipeline with apply/map deferred its own parent
		// registration until its slot state populated. The cascade let parents
		// gate-proceed before descendants registered, capturing zero pixels.
		// Surface: a nested Pipeline using <LinearGradient> (a RasterSource
		// generator) as both children leaf and as the map subtree, at non-square
		// non-64 dimensions to expose any width-fill / preW assumptions.
		function MultiplyByMap({ children, map }: { children: React.ReactNode; map: React.ReactNode }) {
			const effect = useCallback<PipelineCallback>((target, _apply, mapPixels) => {
				if (!mapPixels) return { pixels: target };

				const out = new Uint8ClampedArray(target.data.length);

				for (let offset = 0; offset < target.data.length; offset += 4) {
					out[offset] = Math.round((target.data[offset]! * mapPixels.data[offset]!) / 255);
					out[offset + 1] = Math.round((target.data[offset + 1]! * mapPixels.data[offset + 1]!) / 255);
					out[offset + 2] = Math.round((target.data[offset + 2]! * mapPixels.data[offset + 2]!) / 255);
					out[offset + 3] = target.data[offset + 3]!;
				}

				return { pixels: new ImageData(out, target.width, target.height) };
			}, []);

			return <Pipeline effect={effect} map={map}>{children}</Pipeline>;
		}

		const W = 200;
		const H = 128;

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: W, height: H }}>
				<MultiplyByMap
					map={
						<LinearGradient
							width={W}
							height={H}
							angle={0}
							stops={[
								{ color: "#000000", position: 0 },
								{ color: "#ffffff", position: 1 },
							]}
						/>
					}
				>
					<LinearGradient
						width={W}
						height={H}
						angle={90}
						stops={[
							{ color: "#ff0000", position: 0 },
							{ color: "#ff0000", position: 1 },
						]}
					/>
				</MultiplyByMap>
			</Canvas>,
		);

		try {
			await waitForPipeline(handle.container);
			const canvas = getOuterCanvas(handle.container);

			expect(canvas.width).toBe(W);
			expect(canvas.height).toBe(H);
			expect(canvas.style.height).not.toBe("0px");
			expect(canvas.style.height).not.toBe("");

			const pixels = readPipelineOutput(canvas);

			// Left edge: map=black → product=0. Right edge: map=white → product=red.
			// If outer captured before inner registered, target would be zero
			// everywhere → output zero everywhere → right edge red=0.
			const [leftRed] = readPixel(pixels, 2, H / 2);
			const [rightRed] = readPixel(pixels, W - 3, H / 2);

			expect(leftRed).toBeLessThanOrEqual(10);
			expect(rightRed).toBeGreaterThanOrEqual(200);
		} finally {
			handle.cleanup();
		}
	});
});
