import { useCallback } from "react";
import { describe, expect, test } from "vitest";
import { Canvas } from "../../index";
import { RasterEffect, type RasterEffectCallback } from "./RasterEffect";
import { RasterSource } from "./RasterSource";
import { renderCanvas } from "../utils/render-canvas";
import { readRasterEffectOutput, readPixel } from "../utils/read-raster-effect-output";
import { waitForRasterEffect } from "../utils/wait-for-raster-effect";

function syncDrawRed(canvas: HTMLCanvasElement): void {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	ctx.fillStyle = "red";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

interface Deferred {
	promise: Promise<void>;
	resolve: () => void;
}

function deferred(): Deferred {
	let resolve: () => void = () => {};
	const promise = new Promise<void>((r) => {
		resolve = r;
	});
	return { promise, resolve };
}

/**
 * Wait until the Canvas root has `data-pictel-pending` set. Polls a few
 * frames to give React's `useSyncExternalStore` re-render time to flush after
 * a descendant RasterEffect / RasterSource registers and notifies pending.
 */
function waitForCanvasPending(container: HTMLElement, timeoutMs = 1000): Promise<HTMLElement> {
	return new Promise((resolve, reject) => {
		const start = performance.now();
		const check = () => {
			const canvasRoot = container.querySelector<HTMLElement>("[data-pictel-canvas]");
			if (canvasRoot && canvasRoot.hasAttribute("data-pictel-pending")) {
				resolve(canvasRoot);
				return;
			}
			if (performance.now() - start > timeoutMs) {
				reject(new Error(`waitForCanvasPending: data-pictel-pending not set on [data-pictel-canvas] within ${String(timeoutMs)}ms`));
				return;
			}
			requestAnimationFrame(check);
		};
		setTimeout(check, 0);
	});
}

describe.sequential("RasterSource integration", () => {
	test("DOM contract: emits bare canvas[data-pictel-raster], clears Canvas pending after sync draw", async () => {
		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
				<RasterSource width={100} height={100} draw={syncDrawRed} />
			</Canvas>,
		);

		try {
			await waitForRasterEffect(handle.container);

			const canvas = handle.container.querySelector<HTMLCanvasElement>("canvas[data-pictel-raster]");
			if (!canvas) throw new Error("no canvas[data-pictel-raster] found");

			expect(canvas.tagName).toBe("CANVAS");
			expect(canvas.hasAttribute("data-pictel-raster")).toBe(true);
			expect(canvas.width).toBe(100);
			expect(canvas.height).toBe(100);

			const canvasRoot = handle.container.querySelector<HTMLElement>("[data-pictel-canvas]");
			expect(canvasRoot?.hasAttribute("data-pictel-pending")).toBe(false);
		} finally {
			handle.cleanup();
		}
	});

	test("sync draw clears Canvas pending", async () => {
		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
				<RasterSource width={100} height={100} draw={syncDrawRed} />
			</Canvas>,
		);

		try {
			await waitForRasterEffect(handle.container);

			const canvasRoot = handle.container.querySelector<HTMLElement>("[data-pictel-canvas]");
			if (!canvasRoot) throw new Error("no Canvas root found");

			expect(canvasRoot.hasAttribute("data-pictel-pending")).toBe(false);
		} finally {
			handle.cleanup();
		}
	});

	test("async draw holds pending until resolution", async () => {
		const d = deferred();
		const drawAsync = (canvas: HTMLCanvasElement) => {
			const ctx = canvas.getContext("2d");
			if (ctx) {
				ctx.fillStyle = "blue";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}
			return d.promise;
		};

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
				<RasterSource width={100} height={100} draw={drawAsync} />
			</Canvas>,
		);

		try {
			const canvasRoot = await waitForCanvasPending(handle.container);

			expect(canvasRoot.hasAttribute("data-pictel-pending")).toBe(true);

			d.resolve();

			await waitForRasterEffect(handle.container);

			expect(canvasRoot.hasAttribute("data-pictel-pending")).toBe(false);
		} finally {
			handle.cleanup();
		}
	});

	test("fast-path eligibility: parent RasterEffect captures the leaf canvas", async () => {
		function IdentityRasterEffect({ children }: { children: React.ReactNode }) {
			const effect = useCallback<RasterEffectCallback>((pixels) => ({ pixels }), []);
			return <RasterEffect effect={effect}>{children}</RasterEffect>;
		}

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
				<IdentityRasterEffect>
					<RasterSource width={100} height={100} draw={syncDrawRed} />
				</IdentityRasterEffect>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(handle.container);

			const all = Array.from(
				handle.container.querySelectorAll<HTMLCanvasElement>("canvas[data-pictel-raster]"),
			);

			expect(all.length).toBeGreaterThanOrEqual(2);

			const outer = all.find((candidate) => {
				const prev = candidate.previousElementSibling;
				return prev instanceof HTMLElement && prev.querySelector("canvas[data-pictel-raster]") !== null;
			});

			if (!outer) throw new Error("could not locate outer raster canvas");

			const pixels = readRasterEffectOutput(outer);
			const [r, g, b] = readPixel(pixels, 10, 10);

			expect(r).toBeGreaterThanOrEqual(240);
			expect(g).toBeLessThanOrEqual(15);
			expect(b).toBeLessThanOrEqual(15);
		} finally {
			handle.cleanup();
		}
	});

	test("abort on unmount: in-flight async draw is cancelled cleanly with no leaked pending", async () => {
		const drawNeverResolves = () => new Promise<void>(() => {});

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
				<RasterSource width={100} height={100} draw={drawNeverResolves} />
			</Canvas>,
		);

		const canvasRoot = await waitForCanvasPending(handle.container);
		expect(canvasRoot.hasAttribute("data-pictel-pending")).toBe(true);

		handle.cleanup();

		expect(handle.container.querySelector("[data-pictel-pending]")).toBeNull();
	});
});
