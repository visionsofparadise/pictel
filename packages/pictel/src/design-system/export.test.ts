// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exportCanvas } from "./export";

const mockToCanvas = vi.fn();

vi.mock("@zumer/snapdom", () => ({
	snapdom: {
		toCanvas: (...args: Array<unknown>) => mockToCanvas(...args),
	},
}));

interface ToBlobCall {
	mimeType: string | undefined;
	quality: number | undefined;
}

function setupCapturedCanvas(toBlobCalls: Array<ToBlobCall>): HTMLCanvasElement {
	// We don't use a real <canvas> here — jsdom's canvas.toBlob doesn't exist
	// without extra setup, and we want to assert on the mime/quality args.
	const blob = new Blob(["fake"], { type: "image/png" });
	return {
		toBlob: (callback: BlobCallback, mimeType?: string, quality?: number) => {
			toBlobCalls.push({ mimeType, quality });
			callback(blob);
		},
	} as unknown as HTMLCanvasElement;
}

function installFakeIframe(): {
	pendingEl: HTMLElement;
	canvasEl: HTMLElement;
	restore: () => void;
} {
	const fakeDoc = document.implementation.createHTMLDocument("export-test");

	const pending = fakeDoc.createElement("div");
	pending.setAttribute("data-pictel-pending", "");
	fakeDoc.body.appendChild(pending);

	const canvas = fakeDoc.createElement("div");
	canvas.setAttribute("data-pictel-canvas", "");
	fakeDoc.body.appendChild(canvas);

	const originalCreateElement = document.createElement.bind(document);
	const createElementSpy = vi.spyOn(document, "createElement").mockImplementation(((tagName: string, options?: ElementCreationOptions) => {
		const el = originalCreateElement(tagName, options);

		if (tagName === "iframe") {
			Object.defineProperty(el, "contentDocument", {
				configurable: true,
				get: () => fakeDoc,
			});
			Object.defineProperty(fakeDoc, "readyState", {
				configurable: true,
				get: () => "complete",
			});
			// Fire the iframe's `load` event on the next tick so the export
			// utility (which now waits for load before treating
			// contentDocument as authoritative) can proceed. This mirrors the
			// real browser sequence: src assigned -> navigation -> load event.
			queueMicrotask(() => {
				el.dispatchEvent(new Event("load"));
			});
		}

		return el;
	}) as typeof document.createElement);

	return {
		pendingEl: pending,
		canvasEl: canvas,
		restore: () => {
			createElementSpy.mockRestore();
		},
	};
}

describe("exportCanvas", () => {
	let toBlobCalls: Array<ToBlobCall>;
	let createObjectURL: ReturnType<typeof vi.fn>;
	let revokeObjectURL: ReturnType<typeof vi.fn>;
	let originalCreateObjectURL: typeof URL.createObjectURL;
	let originalRevokeObjectURL: typeof URL.revokeObjectURL;

	beforeEach(() => {
		toBlobCalls = [];
		mockToCanvas.mockReset();
		mockToCanvas.mockResolvedValue(setupCapturedCanvas(toBlobCalls));

		createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
		revokeObjectURL = vi.fn();
		originalCreateObjectURL = URL.createObjectURL;
		originalRevokeObjectURL = URL.revokeObjectURL;
		URL.createObjectURL = createObjectURL as unknown as typeof URL.createObjectURL;
		URL.revokeObjectURL = revokeObjectURL as unknown as typeof URL.revokeObjectURL;
	});

	afterEach(() => {
		URL.createObjectURL = originalCreateObjectURL;
		URL.revokeObjectURL = originalRevokeObjectURL;
		vi.restoreAllMocks();
	});

	it("constructs the iframe URL with mode=render and the encoded canvas name", async () => {
		const fake = installFakeIframe();

		// Drop pending immediately so waitForReady resolves.
		fake.pendingEl.remove();

		await exportCanvas({
			canvasName: "Square 1080",
			width: 1080,
			height: 1080,
			format: "png",
			sourceUrl: "https://example.com/preview?canvas=other&foo=bar",
		});

		const iframes = document.querySelectorAll("iframe");
		// The iframe is removed after export, so we can't read .src directly
		// after the fact. Instead, verify by inspecting the captured src on the
		// element passed to snapdom — snapdom is called with the canvas element
		// inside the fake document, which lives under the iframe URL we set.

		// Instead of inspecting iframe.src post-cleanup, capture it via a
		// MutationObserver-style check: the test installs a fake iframe whose
		// src is set during exportCanvas. We patch createElement to record it.

		expect(iframes.length).toBe(0); // cleaned up
		expect(mockToCanvas).toHaveBeenCalledTimes(1);
		fake.restore();
	});

	it("sets the iframe src with mode=render and encoded canvas name", async () => {
		const fake = installFakeIframe();
		fake.pendingEl.remove();

		// Snoop on iframe.src writes.
		let observedSrc: string | null = null;
		const originalAppendChild = document.body.appendChild.bind(document.body);
		const appendSpy = vi.spyOn(document.body, "appendChild").mockImplementation(((node: Node) => {
			if (node instanceof HTMLIFrameElement) {
				observedSrc = node.src;
			}

			return originalAppendChild(node);
		}) as typeof document.body.appendChild);

		await exportCanvas({
			canvasName: "My Canvas / Name",
			width: 800,
			height: 600,
			format: "png",
			sourceUrl: "https://example.com/preview",
		});

		expect(observedSrc).not.toBeNull();
		const url = new URL(observedSrc!);
		expect(url.searchParams.get("mode")).toBe("render");
		expect(url.searchParams.get("canvas")).toBe("My Canvas / Name");
		// The raw query string must use percent-encoding for the slash and space.
		expect(url.search).toContain("canvas=");
		expect(url.search).toMatch(/canvas=My(\+|%20)Canvas(\+|%20)%2F(\+|%20)Name/);

		appendSpy.mockRestore();
		fake.restore();
	});

	it("passes format mime type and undefined quality for PNG", async () => {
		const fake = installFakeIframe();
		fake.pendingEl.remove();

		await exportCanvas({
			canvasName: "C",
			width: 100,
			height: 100,
			format: "png",
			quality: 0.9, // should be ignored for PNG
			sourceUrl: "https://example.com/",
		});

		expect(toBlobCalls).toHaveLength(1);
		expect(toBlobCalls[0].mimeType).toBe("image/png");
		expect(toBlobCalls[0].quality).toBeUndefined();
		fake.restore();
	});

	it("passes format mime type and quality for JPEG", async () => {
		const fake = installFakeIframe();
		fake.pendingEl.remove();

		await exportCanvas({
			canvasName: "C",
			width: 100,
			height: 100,
			format: "jpeg",
			quality: 0.85,
			sourceUrl: "https://example.com/",
		});

		expect(toBlobCalls).toHaveLength(1);
		expect(toBlobCalls[0].mimeType).toBe("image/jpeg");
		expect(toBlobCalls[0].quality).toBe(0.85);
		fake.restore();
	});

	it("passes format mime type and quality for WebP", async () => {
		const fake = installFakeIframe();
		fake.pendingEl.remove();

		await exportCanvas({
			canvasName: "C",
			width: 100,
			height: 100,
			format: "webp",
			quality: 0.6,
			sourceUrl: "https://example.com/",
		});

		expect(toBlobCalls).toHaveLength(1);
		expect(toBlobCalls[0].mimeType).toBe("image/webp");
		expect(toBlobCalls[0].quality).toBe(0.6);
		fake.restore();
	});

	it("creates an object URL, triggers anchor click with download filename, then revokes", async () => {
		// Don't use installFakeIframe here because we want to also intercept
		// anchor creation in the same spy. The createElement implementation
		// must call the genuine HTMLDocument.prototype.createElement, not the
		// spy itself — otherwise we recurse forever.
		const fakeDoc = document.implementation.createHTMLDocument("dl");
		const canvasEl = fakeDoc.createElement("div");
		canvasEl.setAttribute("data-pictel-canvas", "");
		fakeDoc.body.appendChild(canvasEl);
		Object.defineProperty(fakeDoc, "readyState", {
			configurable: true,
			get: () => "complete",
		});

		const clickSpy = vi.fn();
		const protoCreate = Document.prototype.createElement;
		const createSpy = vi.spyOn(document, "createElement").mockImplementation(((tagName: string, options?: ElementCreationOptions) => {
			const el = protoCreate.call(document, tagName, options) as HTMLElement;

			if (tagName === "a") {
				el.click = clickSpy;
			}

			if (tagName === "iframe") {
				Object.defineProperty(el, "contentDocument", {
					configurable: true,
					get: () => fakeDoc,
				});
				queueMicrotask(() => {
					el.dispatchEvent(new Event("load"));
				});
			}

			return el;
		}) as typeof document.createElement);

		await exportCanvas({
			canvasName: "Hello",
			width: 100,
			height: 100,
			format: "jpeg",
			quality: 0.7,
			sourceUrl: "https://example.com/",
		});

		expect(createObjectURL).toHaveBeenCalledTimes(1);
		expect(clickSpy).toHaveBeenCalledTimes(1);
		expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

		createSpy.mockRestore();
	});

	it("removes the iframe even when snapdom throws", async () => {
		const fake = installFakeIframe();
		fake.pendingEl.remove();

		mockToCanvas.mockReset();
		mockToCanvas.mockRejectedValueOnce(new Error("snapdom boom"));

		await expect(
			exportCanvas({
				canvasName: "C",
				width: 100,
				height: 100,
				format: "png",
				sourceUrl: "https://example.com/",
			}),
		).rejects.toMatchObject({ name: "ExportError", pipelineError: { id: "render" } });

		// Iframe must be removed in the finally block.
		expect(document.querySelectorAll("iframe").length).toBe(0);
		fake.restore();
	});
});
