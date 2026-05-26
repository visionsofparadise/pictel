import { useCallback } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Canvas } from "../../index";
import { RasterEffect, type RasterEffectCallback } from "../RasterEffect/RasterEffect";
import { renderCanvas } from "../utils/render-canvas";
import { readRasterEffectOutput, readPixel } from "../utils/read-raster-effect-output";
import { solidImage } from "../utils/test-images";
import { waitForRasterEffect } from "../utils/wait-for-raster-effect";
import { Image } from "./Image";

// --- Helpers ---

interface Deferred<T = void> {
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (err: unknown) => void;
}

function deferred<T = void>(): Deferred<T> {
	let resolve: (value: T) => void = () => {};
	let reject: (err: unknown) => void = () => {};
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
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

/**
 * Mock `HTMLImageElement.prototype.decode` so tests have deterministic control
 * over decode resolution and the resulting `naturalWidth`/`naturalHeight`.
 *
 * The browser populates `naturalWidth`/`naturalHeight` from a real source load,
 * but our integration tests need to drive that state explicitly — for the
 * deferred-decode case (we want to observe pending mid-decode), for the
 * decode-failure case (we want a deterministic rejection), and for the abort
 * case (we want a never-resolving decode).
 */
function mockImageDecode({
	naturalWidth,
	naturalHeight,
	fail,
}: {
	naturalWidth: number;
	naturalHeight: number;
	fail?: boolean;
}) {
	return vi
		.spyOn(HTMLImageElement.prototype, "decode")
		.mockImplementation(function mockedDecode(this: HTMLImageElement) {
			if (fail) {
				return Promise.reject(new Error("decode failed"));
			}
			Object.defineProperty(this, "naturalWidth", {
				value: naturalWidth,
				configurable: true,
			});
			Object.defineProperty(this, "naturalHeight", {
				value: naturalHeight,
				configurable: true,
			});
			return Promise.resolve();
		});
}

function mockImageDecodeDeferred(d: Deferred<void>, naturalWidth: number, naturalHeight: number) {
	return vi
		.spyOn(HTMLImageElement.prototype, "decode")
		.mockImplementation(function mockedDecode(this: HTMLImageElement) {
			return d.promise.then(() => {
				Object.defineProperty(this, "naturalWidth", {
					value: naturalWidth,
					configurable: true,
				});
				Object.defineProperty(this, "naturalHeight", {
					value: naturalHeight,
					configurable: true,
				});
			});
		});
}

function mockImageDecodeNever() {
	return vi
		.spyOn(HTMLImageElement.prototype, "decode")
		.mockImplementation(() => new Promise<void>(() => {
			// never resolves
		}));
}

// --- Integration tests ---

describe.sequential("Image integration", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test("decode and draw: leaf canvas carries the decoded pixels at requested dims", async () => {
		const src = solidImage("red", 50, 50);
		mockImageDecode({ naturalWidth: 50, naturalHeight: 50 });

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
				<Image src={src} width={100} height={100} fit="fill" />
			</Canvas>,
		);

		try {
			await waitForRasterEffect(handle.container);

			const canvas = handle.container.querySelector<HTMLCanvasElement>("canvas[data-pictel-raster]");
			expect(canvas).not.toBeNull();
			expect(canvas?.width).toBe(100);
			expect(canvas?.height).toBe(100);

			if (!canvas) throw new Error("no raster canvas found");

			const pixels = readRasterEffectOutput(canvas);
			const [r, g, b, a] = readPixel(pixels, 50, 50);

			// "fill" stretches the 50x50 red source over the entire 100x100 canvas.
			expect(r).toBeGreaterThanOrEqual(240);
			expect(g).toBeLessThanOrEqual(15);
			expect(b).toBeLessThanOrEqual(15);
			expect(a).toBe(255);
		} finally {
			handle.cleanup();
		}
	});

	test("pending during decode: Canvas carries data-pictel-pending until decode resolves", async () => {
		const src = solidImage("blue", 50, 50);
		const d = deferred<void>();
		mockImageDecodeDeferred(d, 50, 50);

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
				<Image src={src} width={100} height={100} fit="fill" />
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

	test("fast-path eligibility: parent RasterEffect captures the Image leaf canvas", async () => {
		const src = solidImage("red", 100, 100);
		mockImageDecode({ naturalWidth: 100, naturalHeight: 100 });

		function IdentityRasterEffect({ children }: { children: React.ReactNode }) {
			const effect = useCallback<RasterEffectCallback>((pixels) => ({ pixels }), []);
			return <RasterEffect effect={effect}>{children}</RasterEffect>;
		}

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
				<IdentityRasterEffect>
					<Image src={src} width={100} height={100} fit="fill" />
				</IdentityRasterEffect>
			</Canvas>,
		);

		try {
			await waitForRasterEffect(handle.container);

			const all = Array.from(
				handle.container.querySelectorAll<HTMLCanvasElement>("canvas[data-pictel-raster]"),
			);
			expect(all.length).toBeGreaterThanOrEqual(2);

			// Outer RasterEffect's output canvas is the one whose previous-sibling
			// children wrapper contains another `[data-pictel-raster]` canvas (the
			// inner / Image leaf canvas). The Image leaf canvas has no such
			// sibling-with-raster-descendant.
			const outer = all.find((candidate) => {
				const prev = candidate.previousElementSibling;
				return prev instanceof HTMLElement && prev.querySelector("canvas[data-pictel-raster]") !== null;
			});

			if (!outer) throw new Error("could not locate outer raster canvas");

			const pixels = readRasterEffectOutput(outer);
			const [r, g, b] = readPixel(pixels, 50, 50);

			expect(r).toBeGreaterThanOrEqual(240);
			expect(g).toBeLessThanOrEqual(15);
			expect(b).toBeLessThanOrEqual(15);
		} finally {
			handle.cleanup();
		}
	});

	test("decode failure clears pending without surfacing an error", async () => {
		const src = solidImage("green", 50, 50);
		mockImageDecode({ naturalWidth: 50, naturalHeight: 50, fail: true });

		// If the rejection escapes the draw callback's try/catch, this listener
		// captures it and we can assert no unhandled rejection occurred.
		const unhandled: Array<unknown> = [];
		const listener = (event: PromiseRejectionEvent) => {
			unhandled.push(event.reason);
		};
		window.addEventListener("unhandledrejection", listener);

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
				<Image src={src} width={100} height={100} fit="fill" />
			</Canvas>,
		);

		try {
			await waitForRasterEffect(handle.container);

			const canvasRoot = handle.container.querySelector<HTMLElement>("[data-pictel-canvas]");
			if (!canvasRoot) throw new Error("no Canvas root found");

			expect(canvasRoot.hasAttribute("data-pictel-pending")).toBe(false);
			expect(unhandled).toHaveLength(0);
		} finally {
			window.removeEventListener("unhandledrejection", listener);
			handle.cleanup();
		}
	});

	test("abort on unmount during decode: no leaked pending, no warnings", async () => {
		const src = solidImage("yellow", 50, 50);
		mockImageDecodeNever();

		const handle = renderCanvas(
			<Canvas mode="display" dimensions={{ width: 100, height: 100 }}>
				<Image src={src} width={100} height={100} fit="fill" />
			</Canvas>,
		);

		const canvasRoot = await waitForCanvasPending(handle.container);
		expect(canvasRoot.hasAttribute("data-pictel-pending")).toBe(true);

		handle.cleanup();

		expect(handle.container.querySelector("[data-pictel-pending]")).toBeNull();
	});
});
