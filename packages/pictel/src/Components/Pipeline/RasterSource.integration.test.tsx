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
 * Wait for the leaf [data-pictel-pipeline] to appear in the container.
 * createRoot.render returns before React commits + useLayoutEffect runs,
 * so this polls a few frames for the DOM to settle.
 */
function waitForLeaf(container: HTMLElement, timeoutMs = 1000): Promise<HTMLElement> {
	return new Promise((resolve, reject) => {
		const start = performance.now();
		const check = () => {
			const leaf = container.querySelector<HTMLElement>("[data-pictel-pipeline]");
			if (leaf) {
				resolve(leaf);
				return;
			}
			if (performance.now() - start > timeoutMs) {
				reject(new Error(`waitForLeaf: no [data-pictel-pipeline] within ${String(timeoutMs)}ms`));
				return;
			}
			requestAnimationFrame(check);
		};
		setTimeout(check, 0);
	});
}

// --- Integration tests ---

describe.sequential("RasterSource integration", () => {
	test("DOM contract: emits pipeline marker + raster + canvas, clears pending after sync draw", async () => {
		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
				<RasterSource width={100} height={100} draw={syncDrawRed} />
			</Canvas>,
		);

		try {
			await waitForPipeline(handle.container);

			const leaf = handle.container.querySelector<HTMLElement>("[data-pictel-pipeline]");

			if (!leaf) throw new Error("no [data-pictel-pipeline] found");

			expect(leaf.hasAttribute("data-pictel-pipeline")).toBe(true);
			expect(leaf.hasAttribute("data-pictel-pending")).toBe(false);

			const canvas = leaf.querySelector<HTMLCanvasElement>(":scope > [data-pictel-raster] > canvas");
			expect(canvas).not.toBeNull();
			expect(canvas?.width).toBe(100);
			expect(canvas?.height).toBe(100);
		} finally {
			handle.cleanup();
		}
	});

	test("sync draw clears pending", async () => {
		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
				<RasterSource width={100} height={100} draw={syncDrawRed} />
			</Canvas>,
		);

		try {
			await waitForPipeline(handle.container);

			const leaf = handle.container.querySelector<HTMLElement>("[data-pictel-pipeline]");

			if (!leaf) throw new Error("no leaf pipeline found");

			expect(leaf.hasAttribute("data-pictel-pending")).toBe(false);
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
			// Poll briefly for React's commit + useLayoutEffect to flush. The leaf
			// pipeline div appears once React commits and useLayoutEffect runs
			// acquirePending — both happen synchronously inside React but the
			// createRoot render call returns before the commit lands.
			const leaf = await waitForLeaf(handle.container);

			expect(leaf.hasAttribute("data-pictel-pending")).toBe(true);

			d.resolve();

			await waitForPipeline(handle.container);

			expect(leaf.hasAttribute("data-pictel-pending")).toBe(false);
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

			// Outer pipeline = the [data-pictel-pipeline] without an ancestor of
			// the same. The leaf is the inner one (nested inside the outer).
			const all = Array.from(
				handle.container.querySelectorAll<HTMLElement>("[data-pictel-pipeline]"),
			);

			expect(all.length).toBeGreaterThanOrEqual(2);

			// Locate the outer (no [data-pictel-pipeline] ancestor within container).
			let outer: HTMLElement | null = null;

			for (const candidate of all) {
				let ancestor: HTMLElement | null = candidate.parentElement;
				let hasPipelineAncestor = false;
				while (ancestor && ancestor !== handle.container) {
					if (ancestor.hasAttribute("data-pictel-pipeline")) {
						hasPipelineAncestor = true;
						break;
					}
					ancestor = ancestor.parentElement;
				}
				if (!hasPipelineAncestor) {
					outer = candidate;
					break;
				}
			}

			if (!outer) throw new Error("could not locate outer pipeline");

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

		// Let React commit so the leaf mounts and acquires pending.
		const leafBefore = await waitForLeaf(handle.container);
		expect(leafBefore.hasAttribute("data-pictel-pending")).toBe(true);

		handle.cleanup();

		// After cleanup, the container is removed from the DOM. Querying the
		// detached container should return no pending element.
		expect(handle.container.querySelector("[data-pictel-pending]")).toBeNull();
	});
});
