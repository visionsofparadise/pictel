// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Canvas } from "../Canvas";
import { RasterEffect, type RasterEffectCallback } from "./RasterEffect";

// snapdom requires a real layout engine — stub in jsdom.
vi.mock("@zumer/snapdom", () => ({
	snapdom: {
		toCanvas: vi.fn().mockResolvedValue({
			getContext: () => ({
				getImageData: (_x: number, _y: number, w: number, h: number) =>
					new ImageData(new Uint8ClampedArray(w * h * 4).fill(128), w, h),
			}),
			width: 64,
			height: 64,
		}),
	},
}));

/** Mount JSX, return cleanup handle. */
function mount(jsx: React.ReactElement): { container: HTMLElement; root: Root; cleanup: () => void } {
	const container = document.createElement("div");
	container.style.width = "64px";
	container.style.height = "64px";
	document.body.appendChild(container);
	const root = createRoot(container);
	root.render(jsx);

	return {
		container,
		root,
		cleanup: () => {
			root.unmount();
			container.remove();
		},
	};
}

/** Wait until [data-pictel-canvas][data-pictel-pending] is no longer set. */
function waitForResolved(container: HTMLElement, timeout = 5000): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		const start = Date.now();
		let frames = 0;

		function check() {
			frames++;

			if (frames >= 4 && container.querySelector("[data-pictel-canvas][data-pictel-pending]") === null) {
				resolve();
				return;
			}

			if (Date.now() - start > timeout) {
				const pending = Array.from(container.querySelectorAll("[data-pictel-canvas][data-pictel-pending]")).length;
				reject(new Error(`waitForResolved timed out — ${String(pending)} Canvas roots still pending`));
				return;
			}

			requestAnimationFrame(check);
		}

		setTimeout(check, 0);
	});
}

// jsdom does not ship ImageData.
if (typeof globalThis.ImageData === "undefined") {
	class FakeImageData {
		data: Uint8ClampedArray;
		width: number;
		height: number;

		constructor(data: Uint8ClampedArray, width: number, height: number) {
			this.data = data;
			this.width = width;
			this.height = height;
		}
	}

	globalThis.ImageData = FakeImageData as unknown as typeof ImageData;
}

// jsdom does not perform layout (offsetWidth/Height + getBoundingClientRect return 0) and lacks ResizeObserver — fake all three to satisfy the zero-size gate.
if (typeof globalThis.ResizeObserver === "undefined") {
	Element.prototype.getBoundingClientRect = function () {
		return { width: 64, height: 64, top: 0, left: 0, right: 64, bottom: 64, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
	};

	Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
		configurable: true,
		get: () => 64,
	});
	Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
		configurable: true,
		get: () => 64,
	});

	class FakeResizeObserver {
		constructor(_callback: ResizeObserverCallback) {}
		observe(_target: Element) { /* no-op */ }
		unobserve(_target: Element) { /* no-op */ }
		disconnect() { /* no-op */ }
	}

	globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
}

const handles: Array<{ cleanup: () => void }> = [];

afterEach(() => {
	for (const handle of handles.splice(0)) {
		handle.cleanup();
	}
});

describe("RasterEffect — callback invocation", () => {
	it("children-only: calls effect(target, undefined, undefined)", async () => {
		const effect = vi.fn<RasterEffectCallback>().mockResolvedValue({
			pixels: new ImageData(new Uint8ClampedArray(64 * 64 * 4).fill(0), 64, 64),
		});

		const handle = mount(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<RasterEffect effect={effect}>
					<div style={{ width: 64, height: 64, background: "red" }} />
				</RasterEffect>
			</Canvas>,
		);
		handles.push(handle);

		await waitForResolved(handle.container);

		expect(effect).toHaveBeenCalledOnce();
		const [target, apply, map] = effect.mock.calls[0] as [ImageData, ImageData | undefined, ImageData | undefined];
		expect(target).toBeInstanceOf(ImageData);
		expect(apply).toBeUndefined();
		expect(map).toBeUndefined();
	});

	it("with map: calls effect(target, undefined, mapPixels)", async () => {
		const effect = vi.fn<RasterEffectCallback>().mockResolvedValue({
			pixels: new ImageData(new Uint8ClampedArray(64 * 64 * 4).fill(0), 64, 64),
		});

		const handle = mount(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<RasterEffect
					effect={effect}
					map={<div style={{ width: 64, height: 64, background: "white" }} />}
				>
					<div style={{ width: 64, height: 64, background: "red" }} />
				</RasterEffect>
			</Canvas>,
		);
		handles.push(handle);

		await waitForResolved(handle.container);

		expect(effect).toHaveBeenCalledOnce();
		const [target, apply, map] = effect.mock.calls[0] as [ImageData, ImageData | undefined, ImageData | undefined];
		expect(target).toBeInstanceOf(ImageData);
		expect(apply).toBeUndefined();
		expect(map).toBeInstanceOf(ImageData);
	});

	it("with apply: calls effect(target, applyPixels, undefined)", async () => {
		const effect = vi.fn<RasterEffectCallback>().mockResolvedValue({
			pixels: new ImageData(new Uint8ClampedArray(64 * 64 * 4).fill(0), 64, 64),
		});

		const handle = mount(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<RasterEffect
					effect={effect}
					apply={<div style={{ width: 64, height: 64, background: "blue" }} />}
				>
					<div style={{ width: 64, height: 64, background: "red" }} />
				</RasterEffect>
			</Canvas>,
		);
		handles.push(handle);

		await waitForResolved(handle.container);

		expect(effect).toHaveBeenCalledOnce();
		const [target, apply, map] = effect.mock.calls[0] as [ImageData, ImageData | undefined, ImageData | undefined];
		expect(target).toBeInstanceOf(ImageData);
		expect(apply).toBeInstanceOf(ImageData);
		expect(map).toBeUndefined();
	});

	it("with both apply and map: calls effect(target, applyPixels, mapPixels)", async () => {
		const effect = vi.fn<RasterEffectCallback>().mockResolvedValue({
			pixels: new ImageData(new Uint8ClampedArray(64 * 64 * 4).fill(0), 64, 64),
		});

		const handle = mount(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<RasterEffect
					effect={effect}
					apply={<div style={{ width: 64, height: 64, background: "blue" }} />}
					map={<div style={{ width: 64, height: 64, background: "white" }} />}
				>
					<div style={{ width: 64, height: 64, background: "red" }} />
				</RasterEffect>
			</Canvas>,
		);
		handles.push(handle);

		await waitForResolved(handle.container);

		expect(effect).toHaveBeenCalledOnce();
		const [target, apply, map] = effect.mock.calls[0] as [ImageData, ImageData | undefined, ImageData | undefined];
		expect(target).toBeInstanceOf(ImageData);
		expect(apply).toBeInstanceOf(ImageData);
		expect(map).toBeInstanceOf(ImageData);
	});
});

describe("RasterEffect — pending flag lifecycle", () => {
	it("Canvas-root [data-pictel-pending] is cleared after resolve", async () => {
		const effect = vi.fn<RasterEffectCallback>().mockResolvedValue({
			pixels: new ImageData(new Uint8ClampedArray(64 * 64 * 4).fill(0), 64, 64),
		});

		const handle = mount(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<RasterEffect effect={effect}>
					<div style={{ width: 64, height: 64 }} />
				</RasterEffect>
			</Canvas>,
		);
		handles.push(handle);

		await waitForResolved(handle.container);

		const canvasRoot = handle.container.querySelector<HTMLElement>("[data-pictel-canvas]");
		expect(canvasRoot).not.toBeNull();
		expect(canvasRoot?.hasAttribute("data-pictel-pending")).toBe(false);
	});

	it("cleanup on unmount clears pending", async () => {
		const effect = vi.fn<RasterEffectCallback>().mockResolvedValue({
			pixels: new ImageData(new Uint8ClampedArray(64 * 64 * 4).fill(0), 64, 64),
		});

		const handle = mount(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<RasterEffect effect={effect}>
					<div style={{ width: 64, height: 64 }} />
				</RasterEffect>
			</Canvas>,
		);

		await waitForResolved(handle.container);

		const canvasRoot = handle.container.querySelector<HTMLElement>("[data-pictel-canvas]");
		expect(canvasRoot?.hasAttribute("data-pictel-pending")).toBe(false);

		handle.cleanup();
	});
});

describe("RasterEffect — overflow attrs", () => {
	it("overflow from callback lands on canvas data-pictel-overflow-* attrs", async () => {
		const effect = vi.fn<RasterEffectCallback>().mockResolvedValue({
			pixels: new ImageData(new Uint8ClampedArray(64 * 64 * 4).fill(0), 64, 64),
			overflow: { top: 5, right: 10, bottom: 15, left: 20 },
		});

		const handle = mount(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<RasterEffect effect={effect}>
					<div style={{ width: 64, height: 64 }} />
				</RasterEffect>
			</Canvas>,
		);
		handles.push(handle);

		await waitForResolved(handle.container);

		const canvas = handle.container.querySelector<HTMLCanvasElement>("canvas[data-pictel-raster]");
		expect(canvas).not.toBeNull();
		expect(canvas?.dataset.pictelOverflowTop).toBe("5");
		expect(canvas?.dataset.pictelOverflowRight).toBe("10");
		expect(canvas?.dataset.pictelOverflowBottom).toBe("15");
		expect(canvas?.dataset.pictelOverflowLeft).toBe("20");
	});

	it("cleanup on unmount removes canvas (with its overflow attrs)", async () => {
		const effect = vi.fn<RasterEffectCallback>().mockResolvedValue({
			pixels: new ImageData(new Uint8ClampedArray(64 * 64 * 4).fill(0), 64, 64),
			overflow: { top: 5, right: 5, bottom: 5, left: 5 },
		});

		const handle = mount(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<RasterEffect effect={effect}>
					<div style={{ width: 64, height: 64 }} />
				</RasterEffect>
			</Canvas>,
		);

		await waitForResolved(handle.container);

		const canvas = handle.container.querySelector<HTMLCanvasElement>("canvas[data-pictel-raster]");
		expect(canvas?.dataset.pictelOverflowTop).toBe("5");

		handle.cleanup();
	});
});

describe("RasterEffect — map renders offscreen", () => {
	it("map content is not in the visible document flow", async () => {
		const effect = vi.fn<RasterEffectCallback>().mockResolvedValue({
			pixels: new ImageData(new Uint8ClampedArray(64 * 64 * 4).fill(0), 64, 64),
		});

		const handle = mount(
			<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
				<RasterEffect
					effect={effect}
					map={<div data-testid="map-content" style={{ width: 64, height: 64 }} />}
				>
					<div style={{ width: 64, height: 64 }} />
				</RasterEffect>
			</Canvas>,
		);
		handles.push(handle);

		await waitForResolved(handle.container);

		const mapContent = document.querySelector("[data-testid='map-content']");
		expect(mapContent).not.toBeNull();

		let current: Element | null = mapContent;
		let foundCanvas = false;
		let foundRaster = false;

		while (current) {
			if (current.hasAttribute("data-pictel-canvas")) {
				foundCanvas = true;
				break;
			}

			if (current.tagName === "CANVAS" && current.hasAttribute("data-pictel-raster")) {
				foundRaster = true;
			}

			current = current.parentElement;
		}

		expect(foundCanvas).toBe(true);
		expect(foundRaster).toBe(false);
	});
});

describe("RasterEffect — StrictMode safety", () => {
	it("resolves correctly after StrictMode double-mount", async () => {
		const effect = vi.fn<RasterEffectCallback>().mockResolvedValue({
			pixels: new ImageData(new Uint8ClampedArray(64 * 64 * 4).fill(200), 64, 64),
		});

		const handle = mount(
			<StrictMode>
				<Canvas mode="display" dimensions={{ width: 64, height: 64 }}>
					<RasterEffect effect={effect}>
						<div style={{ width: 64, height: 64, background: "#808080" }} />
					</RasterEffect>
				</Canvas>
			</StrictMode>,
		);
		handles.push(handle);

		await waitForResolved(handle.container);

		const canvasRoot = handle.container.querySelector<HTMLElement>("[data-pictel-canvas]");
		expect(canvasRoot?.hasAttribute("data-pictel-pending")).toBe(false);

		const canvas = handle.container.querySelector<HTMLCanvasElement>("canvas[data-pictel-raster]");
		expect(canvas).not.toBeNull();
		expect(canvas?.width).toBeGreaterThan(0);
		expect(canvas?.height).toBeGreaterThan(0);
	});
});
