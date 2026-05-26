import { snapdom } from "@zumer/snapdom";
import { createRasterEffectError, type RasterEffectError } from "../Components/RasterEffect/Error";

export class ExportError extends Error {
	readonly pipelineError: RasterEffectError;

	constructor(pipelineError: RasterEffectError) {
		super(pipelineError.error.message);
		this.name = "ExportError";
		this.pipelineError = pipelineError;
	}
}

export interface ExportOptions {
	canvasName: string;
	width: number;
	height: number;
	format: "png" | "jpeg" | "webp";
	quality?: number;
	sourceUrl: string;
}

const PENDING_TIMEOUT_MS = 30_000;

const CANVAS_SELECTOR = "[data-pictel-canvas]";

export async function exportCanvas(options: ExportOptions): Promise<void> {
	const url = new URL(options.sourceUrl);
	url.searchParams.set("mode", "render");
	url.searchParams.set("canvas", options.canvasName);

	const iframe = document.createElement("iframe");
	iframe.width = String(options.width);
	iframe.height = String(options.height);
	iframe.style.position = "fixed";
	iframe.style.left = "-99999px";
	iframe.style.top = "0";
	iframe.style.border = "0";
	iframe.src = url.toString();
	document.body.appendChild(iframe);

	try {
		await waitForLoad(iframe);
		await waitForReady(iframe);

		const doc = iframe.contentDocument;

		if (!doc) {
			throw new Error("Export iframe has no contentDocument");
		}

		const canvasRoot = doc.querySelector<HTMLElement>(CANVAS_SELECTOR);

		if (!canvasRoot) {
			throw new Error(`Export iframe contains no [data-pictel-canvas] element (canvas: ${options.canvasName})`);
		}

		const captured = await snapdom.toCanvas(canvasRoot, {
			dpr: 1,
			fast: true,
			width: options.width,
			height: options.height,
		});

		const mimeType = `image/${options.format}` as const;
		const blob = await canvasToBlob(captured, mimeType, options.format === "png" ? undefined : options.quality);

		triggerDownload(blob, `${options.canvasName}.${options.format}`);
	} catch (error) {
		if (error instanceof ExportError) {
			throw error;
		}

		throw new ExportError(createRasterEffectError("render", error));
	} finally {
		iframe.remove();
	}
}

// A freshly-created iframe whose `src` was just assigned can briefly report `contentDocument.readyState === "complete"` for `about:blank` BEFORE navigation begins, so the `load` event is the only trustworthy signal.
function waitForLoad(iframe: HTMLIFrameElement): Promise<void> {
	return new Promise((resolve, reject) => {
		const onLoad = () => {
			iframe.removeEventListener("error", onError);
			resolve();
		};
		const onError = () => {
			iframe.removeEventListener("load", onLoad);
			reject(new Error("Export iframe failed to load"));
		};
		iframe.addEventListener("load", onLoad, { once: true });
		iframe.addEventListener("error", onError, { once: true });
	});
}

// Must only be called after `waitForLoad` resolves — pre-navigation `contentDocument` is `about:blank` where no pending markers ever appear, so `check()` would resolve immediately against an empty document.
function waitForReady(iframe: HTMLIFrameElement): Promise<void> {
	return new Promise((resolve, reject) => {
		let observer: MutationObserver | null = null;
		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		function cleanup() {
			if (observer) {
				observer.disconnect();
				observer = null;
			}

			if (timeoutId !== null) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
		}

		function check(): boolean {
			const doc = iframe.contentDocument;

			if (!doc?.documentElement) return false;

			if (doc.querySelector("[data-pictel-canvas][data-pictel-pending]") === null) {
				cleanup();
				resolve();

				return true;
			}

			return false;
		}

		const doc = iframe.contentDocument;

		if (!doc?.documentElement) {
			reject(new Error("Export iframe contentDocument is unavailable after load"));

			return;
		}

		timeoutId = setTimeout(() => {
			cleanup();
			reject(new Error(`Export timed out after ${PENDING_TIMEOUT_MS}ms waiting for [data-pictel-canvas][data-pictel-pending] to clear`));
		}, PENDING_TIMEOUT_MS);

		if (check()) return;

		observer = new MutationObserver(() => {
			check();
		});
		observer.observe(doc.documentElement, {
			attributes: true,
			subtree: true,
			childList: true,
			attributeFilter: ["data-pictel-pending"],
		});
	});
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number | undefined): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					reject(new Error(`canvas.toBlob returned null for ${mimeType}`));

					return;
				}

				resolve(blob);
			},
			mimeType,
			quality,
		);
	});
}

function triggerDownload(blob: Blob, filename: string): void {
	const objectUrl = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = objectUrl;
	anchor.download = filename;
	document.body.appendChild(anchor);

	try {
		anchor.click();
	} finally {
		anchor.remove();
		URL.revokeObjectURL(objectUrl);
	}
}
