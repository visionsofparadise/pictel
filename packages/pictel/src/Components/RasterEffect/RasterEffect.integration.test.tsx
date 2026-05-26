import { describe, expect, test } from "vitest";
import { StrictMode, useCallback } from "react";
import { Canvas } from "../../index";
import { Invert, LinearGradient, Outline, Threshold, applyInvert } from "@pictel/effects";
import { RasterEffect, type RasterEffectCallback } from "./RasterEffect";
import { renderCanvas } from "../utils/render-canvas";
import { readRasterEffectOutput, readPixel } from "../utils/read-raster-effect-output";
import { solidImage } from "../utils/test-images";
import { waitForRasterEffect } from "../utils/wait-for-raster-effect";

// The outermost effect's canvas is the LAST raster canvas in document order — the parent renders its canvas after its children subtree.
function getOuterCanvas(container: HTMLElement): HTMLCanvasElement {
	const all = Array.from(
		container.querySelectorAll<HTMLCanvasElement>("canvas[data-pictel-raster]"),
	);

	if (all.length === 0) throw new Error("no canvas[data-pictel-raster] found in container");

	return all[all.length - 1]!;
}

function identityEffect(pixels: ImageData): { pixels: ImageData } {
	return { pixels };
}

describe.sequential("RasterEffect integration", () => {
	test("children-only: effect receives target pixels and draws result", async () => {
		function InvertRasterEffect({ children }: { children: React.ReactNode }) {
			const effect = useCallback<RasterEffectCallback>((target) => {
				return { pixels: applyInvert(target, 1) };
			}, []);

			return <RasterEffect effect={effect}>{children}</RasterEffect>;
		}

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<InvertRasterEffect>
					<img src={solidImage("#ff0000", 64, 64)} />
				</InvertRasterEffect>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(handle.container);
			const canvas = getOuterCanvas(handle.container);

			const pixels = readRasterEffectOutput(canvas);
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
		let capturedApply: ImageData | undefined;

		function BlendWithApply({ apply, children }: { apply: React.ReactNode; children: React.ReactNode }) {
			const effect = useCallback<RasterEffectCallback>((target, applyPixels) => {
				capturedApply = applyPixels;

				return { pixels: target };
			}, []);

			return <RasterEffect effect={effect} apply={apply}>{children}</RasterEffect>;
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
			await waitForRasterEffect(handle.container);

			expect(capturedApply).toBeDefined();

			// Inverted red (#ff0000) → cyan: r≈0, g≈255, b≈255.
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
		let capturedMap: ImageData | undefined;

		function EffectWithMap({ map, children }: { map: React.ReactNode; children: React.ReactNode }) {
			const effect = useCallback<RasterEffectCallback>((target, _apply, mapPixels) => {
				capturedMap = mapPixels;

				return { pixels: target };
			}, []);

			return <RasterEffect effect={effect} map={map}>{children}</RasterEffect>;
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
			await waitForRasterEffect(handle.container);

			expect(capturedMap).toBeDefined();

			// Inverted white → black: all channels ≈ 0.
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
		const callOrder: Array<string> = [];

		function Inner({ children }: { children: React.ReactNode }) {
			const effect = useCallback<RasterEffectCallback>((target) => {
				callOrder.push("inner");

				return { pixels: target };
			}, []);

			return <RasterEffect effect={effect}>{children}</RasterEffect>;
		}

		function Outer({ apply, children }: { apply: React.ReactNode; children: React.ReactNode }) {
			const effect = useCallback<RasterEffectCallback>((target) => {
				callOrder.push("outer");

				return { pixels: target };
			}, []);

			return <RasterEffect effect={effect} apply={apply}>{children}</RasterEffect>;
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
			await waitForRasterEffect(handle.container);

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
		function InvertRasterEffect({ children }: { children: React.ReactNode }) {
			const effect = useCallback<RasterEffectCallback>((target) => {
				return { pixels: applyInvert(target, 1) };
			}, []);

			return <RasterEffect effect={effect}>{children}</RasterEffect>;
		}

		const handle = renderCanvas(
			<StrictMode>
				<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
					<InvertRasterEffect>
						<img src={solidImage("#ff0000", 64, 64)} />
					</InvertRasterEffect>
				</Canvas>
			</StrictMode>,
		);

		try {
			await waitForRasterEffect(handle.container);

			const outer = getOuterCanvas(handle.container);
			const pixels = readRasterEffectOutput(outer);
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
		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<RasterEffect effect={identityEffect}>
					<img src={solidImage("#ff0000", 64, 64)} style={{ display: "block" }} />
				</RasterEffect>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(handle.container);

			const canvas = getOuterCanvas(handle.container);

			const rect = canvas.getBoundingClientRect();
			expect(rect.width).toBeGreaterThan(0);
			expect(rect.height).toBeGreaterThan(0);

			const childrenWrapper = canvas.previousElementSibling as HTMLElement | null;
			expect(childrenWrapper).not.toBeNull();
			expect(childrenWrapper?.style.display).toBe("none");

			expect(canvas.style.display).toBe("block");
		} finally {
			handle.cleanup();
		}
	});

	test("apply with chained effects: pending propagates through apply subtree", async () => {
		// Regression: if gate only checks direct [data-pictel-pending] children of applyRef (not all descendants), outer captures a transparent apply image while inner is still pending.
		let capturedApply: ImageData | undefined;

		function OuterWithChainedApply({
			apply,
			children,
		}: {
			apply: React.ReactNode;
			children: React.ReactNode;
		}) {
			const effect = useCallback<RasterEffectCallback>((target, applyPixels) => {
				capturedApply = applyPixels;

				return { pixels: target };
			}, []);

			return <RasterEffect effect={effect} apply={apply}>{children}</RasterEffect>;
		}

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<OuterWithChainedApply
					apply={
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
			await waitForRasterEffect(handle.container);

			expect(capturedApply).toBeDefined();

			if (capturedApply) {
				// A premature capture would have zero alpha everywhere — snapdom captures visibility:hidden as transparent.
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
		// Regression: if the execute() error path doesn't clear pending + notify, pipeline stalls forever.
		const reportedErrors: Array<{ message: string }> = [];

		function ThrowingRasterEffect({ children }: { children: React.ReactNode }) {
			const effect = useCallback<RasterEffectCallback>(() => {
				throw new Error("intentional test error");
			}, []);

			return <RasterEffect effect={effect}>{children}</RasterEffect>;
		}

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<ThrowingRasterEffect>
					<img src={solidImage("#ff0000", 64, 64)} />
				</ThrowingRasterEffect>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(handle.container);

			const canvas = handle.container.querySelector<HTMLElement>("canvas[data-pictel-raster]");
			expect(canvas).toBeNull();

			// ErrorChip renders only when errors.length > 0, so its DOM presence proves reportError fired.
			const errorChip = handle.container.querySelector("[data-pictel-canvas] svg");
			expect(errorChip).not.toBeNull();

			void reportedErrors;
		} finally {
			handle.cleanup();
		}
	});

	test("StrictMode with apply and map both populated: resolves correctly after double-mount", async () => {
		// Regression: first-mount cleanup must disconnect ALL observers (content + apply + map + size) — a stranded apply/mapObserver races the second mount's gate and double-runs execute.
		let capturedApply: ImageData | undefined;
		let capturedMap: ImageData | undefined;

		function RasterEffectWithApplyAndMap({
			apply,
			map,
			children,
		}: {
			apply: React.ReactNode;
			map: React.ReactNode;
			children: React.ReactNode;
		}) {
			const effect = useCallback<RasterEffectCallback>((target, applyPixels, mapPixels) => {
				capturedApply = applyPixels;
				capturedMap = mapPixels;

				return { pixels: target };
			}, []);

			return (
				<RasterEffect effect={effect} apply={apply} map={map}>
					{children}
				</RasterEffect>
			);
		}

		const handle = renderCanvas(
			<StrictMode>
				<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
					<RasterEffectWithApplyAndMap
						apply={<img src={solidImage("#00ff00", 64, 64)} />}
						map={<img src={solidImage("#ffffff", 64, 64)} />}
					>
						<img src={solidImage("#ff0000", 64, 64)} />
					</RasterEffectWithApplyAndMap>
				</Canvas>
			</StrictMode>,
		);

		try {
			await waitForRasterEffect(handle.container);

			expect(capturedApply).toBeDefined();
			expect(capturedMap).toBeDefined();

			if (capturedApply) {
				const idx = (32 * capturedApply.width + 32) * 4;
				expect(capturedApply.data[idx + 1]).toBeGreaterThanOrEqual(200);
			}

			if (capturedMap) {
				const idx = (32 * capturedMap.width + 32) * 4;
				expect(capturedMap.data[idx]).toBeGreaterThanOrEqual(200);
			}
		} finally {
			handle.cleanup();
		}
	});

	test("apply/map subtrees do not inherit CSS from JSX-location ancestors", async () => {
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

		function CapturingRasterEffect({
			apply,
			map,
			children,
		}: {
			apply: React.ReactNode;
			map: React.ReactNode;
			children: React.ReactNode;
		}) {
			const effect = useCallback<RasterEffectCallback>((target) => ({ pixels: target }), []);

			return (
				<RasterEffect effect={effect} apply={apply} map={map}>
					{children}
				</RasterEffect>
			);
		}

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<div style={{ color: "rgb(255, 0, 0)" }}>
					<CapturingRasterEffect
						apply={<ColorProbe kind="apply" />}
						map={<ColorProbe kind="map" />}
					>
						<img src={solidImage("#0000ff", 64, 64)} />
					</CapturingRasterEffect>
				</div>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(handle.container);

			expect(observedColors.apply).not.toBeNull();
			expect(observedColors.map).not.toBeNull();
			expect(observedColors.apply).not.toBe("rgb(255, 0, 0)");
			expect(observedColors.map).not.toBe("rgb(255, 0, 0)");
		} finally {
			handle.cleanup();
		}
	});

	test("outer RasterEffectwith map waits for nested RasterSource cascade at non-square dims", async () => {
		// Regression: outer RasterEffect deferred parent registration until slot state populated — parents gate-proceeded before descendants registered, capturing zero pixels.
		function MultiplyByMap({ children, map }: { children: React.ReactNode; map: React.ReactNode }) {
			const effect = useCallback<RasterEffectCallback>((target, _apply, mapPixels) => {
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

			return <RasterEffect effect={effect} map={map}>{children}</RasterEffect>;
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
			await waitForRasterEffect(handle.container);
			const canvas = getOuterCanvas(handle.container);

			expect(canvas.width).toBe(W);
			expect(canvas.height).toBe(H);
			expect(canvas.style.height).not.toBe("0px");
			expect(canvas.style.height).not.toBe("");

			const pixels = readRasterEffectOutput(canvas);

			// Left edge: map=black → product=0. Right edge: map=white → product=red.
			const [leftRed] = readPixel(pixels, 2, H / 2);
			const [rightRed] = readPixel(pixels, W - 3, H / 2);

			expect(leftRed).toBeLessThanOrEqual(10);
			expect(rightRed).toBeGreaterThanOrEqual(200);
		} finally {
			handle.cleanup();
		}
	});
});
