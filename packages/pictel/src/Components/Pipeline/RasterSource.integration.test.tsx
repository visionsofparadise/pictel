import { useCallback } from "react";
import { describe, expect, test } from "vitest";
import { Canvas } from "../../index";
import { Pipeline, type PipelineCallback } from "./Pipeline";
import { RasterSource } from "./RasterSource";
import { renderCanvas } from "../utils/render-canvas";
import { readPipelineOutput, readPixel } from "../utils/read-pipeline-output";
import { waitForPipeline } from "../utils/wait-for-pipeline";

// --- Helpers ---

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
 * a descendant Pipeline / RasterSource registers and notifies pending.
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

// --- Integration tests ---

describe.sequential("RasterSource integration", () => {
	test("DOM contract: emits bare canvas[data-pictel-raster], clears Canvas pending after sync draw", async () => {
		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
				<RasterSource width={100} height={100} draw={syncDrawRed} />
			</Canvas>,
		);

		try {
			await waitForPipeline(handle.container);

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
			await waitForPipeline(handle.container);

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
			// Poll for the Canvas-root pending mirror — the leaf registers with
			// the parent registry in its layout effect; Canvas re-renders via
			// `useSyncExternalStore` on the resulting notify, flipping the
			// attribute. The createRoot.render call returns before any of this.
			const canvasRoot = await waitForCanvasPending(handle.container);

			expect(canvasRoot.hasAttribute("data-pictel-pending")).toBe(true);

			d.resolve();

			await waitForPipeline(handle.container);

			expect(canvasRoot.hasAttribute("data-pictel-pending")).toBe(false);
		} finally {
			handle.cleanup();
		}
	});

	test("fast-path eligibility: parent Pipeline captures the leaf canvas", async () => {
		// Wrap a RasterSource in an identity Pipeline. After both resolve, the
		// outer pipeline's canvas pixels should match what the inner leaf drew.
		// This proves capture worked end-to-end with RasterSource as the leaf;
		// the fast path is the observable mechanism for that capture under the
		// matching-dim contract.
		function IdentityPipeline({ children }: { children: React.ReactNode }) {
			const effect = useCallback<PipelineCallback>((pixels) => ({ pixels }), []);
			return <Pipeline effect={effect}>{children}</Pipeline>;
		}

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
				<IdentityPipeline>
					<RasterSource width={100} height={100} draw={syncDrawRed} />
				</IdentityPipeline>
			</Canvas>,
		);

		try {
			await waitForPipeline(handle.container);

			// Two raster canvases: the RasterSource leaf and the outer Pipeline's
			// output. The outer's canvas sits as a sibling of a wrapper div that
			// contains the leaf canvas; the leaf has no such sibling-of-wrapper.
			const all = Array.from(
				handle.container.querySelectorAll<HTMLCanvasElement>("canvas[data-pictel-raster]"),
			);

			expect(all.length).toBeGreaterThanOrEqual(2);

			const outer = all.find((candidate) => {
				const prev = candidate.previousElementSibling;
				return prev instanceof HTMLElement && prev.querySelector("canvas[data-pictel-raster]") !== null;
			});

			if (!outer) throw new Error("could not locate outer raster canvas");

			const pixels = readPipelineOutput(outer);
			const [r, g, b] = readPixel(pixels, 10, 10);

			// Identity effect should reproduce the leaf's red fill.
			expect(r).toBeGreaterThanOrEqual(240);
			expect(g).toBeLessThanOrEqual(15);
			expect(b).toBeLessThanOrEqual(15);
		} finally {
			handle.cleanup();
		}
	});

	test("abort on unmount: in-flight async draw is cancelled cleanly with no leaked pending", async () => {
		// A draw that never resolves. Unmount before resolution and verify
		// that the container is empty (no leaked [data-pictel-pending] anywhere)
		// and no warnings escaped.
		const drawNeverResolves = () => new Promise<void>(() => {
			// never resolve
		});

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
				<RasterSource width={100} height={100} draw={drawNeverResolves} />
			</Canvas>,
		);

		// Let React commit so the leaf mounts, registers, and the Canvas
		// re-renders with the pending mirror.
		const canvasRoot = await waitForCanvasPending(handle.container);
		expect(canvasRoot.hasAttribute("data-pictel-pending")).toBe(true);

		handle.cleanup();

		// After cleanup, the container is removed from the DOM. Querying the
		// detached container should return no pending element.
		expect(handle.container.querySelector("[data-pictel-pending]")).toBeNull();
	});
});
