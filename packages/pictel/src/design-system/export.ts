import { snapdom } from "@zumer/snapdom";
import { createRasterEffectError, type RasterEffectError } from "../Components/RasterEffect/Error";

/**
 * Error subclass that carries an attached `RasterEffectError`. The export utility
 * wraps any failure (timeout, missing canvas root, snapdom failure, encoding
 * failure) in this so the caller (RenderStrip) can read `.pipelineError` and
 * forward it through the standard `reportError` channel.
 */
export class ExportError extends Error {
	readonly pipelineError: RasterEffectError;

	constructor(pipelineError: RasterEffectError) {
		super(pipelineError.error.message);
		this.name = "ExportError";
		this.pipelineError = pipelineError;
	}
}

export interface ExportOptions {
	/** Display name of the canvas being exported. Used as the download filename stem and as the `?canvas=` query parameter. */
	canvasName: string;
	/** Target output width in pixels. Sets the iframe width and the snapdom capture width. */
	width: number;
	/** Target output height in pixels. Sets the iframe height and the snapdom capture height. */
	height: number;
	/** Output image format. PNG ignores `quality`. */
	format: "png" | "jpeg" | "webp";
	/** Encoding quality, 0–1. Ignored when `format === "png"`. */
	quality?: number;
	/** Current page URL. The iframe loads this with `?mode=render&canvas=<canvasName>` so it renders the same composition headlessly at target dimensions. */
	sourceUrl: string;
}

const PENDING_TIMEOUT_MS = 30_000;

/**
 * Capture root marker. Set by Canvas (`data-pictel-canvas=""`) on its outermost
 * div. The export utility queries for this attribute inside the iframe to find
 * the element to hand to snapdom. The Canvas component adds this attribute as
 * part of Phase 4 of the design-system rollout.
 */
const CANVAS_SELECTOR = "[data-pictel-canvas]";

/**
 * Render a Canvas in `render` mode inside a hidden iframe at the specified
 * target dimensions, wait for the pipeline to settle, capture via snapdom, and
 * trigger a download as PNG/JPEG/WebP.
 *
 * Mirrors the CLI's headless export path: a render-mode page at exact target
 * dimensions captured after `data-pictel-pending` clears. Errors are wrapped
 * as `RasterEffectError` so the caller (RenderStrip) can surface them in the
 * standard error chip alongside raster-effect errors.
 */
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

/**
 * Resolves when the iframe fires its `load` event — i.e. navigation to the
 * `src` URL has completed and `contentDocument` reflects the rendered target
 * page rather than the initial `about:blank`. A freshly-created iframe whose
 * `src` has just been assigned can briefly report
 * `contentDocument.readyState === "complete"` for `about:blank` BEFORE
 * navigation begins, so the `load` event is the only trustworthy signal.
 */
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

/**
 * Resolves once the iframe document has no
 * `[data-pictel-canvas][data-pictel-pending]` element. Rejects after
 * `PENDING_TIMEOUT_MS`. Must only be called after `waitForLoad(iframe)` has
 * resolved — the contentDocument of a pre-navigation iframe is `about:blank`,
 * where no pending markers ever appear, and `check()` would resolve
 * immediately against an empty document.
 */
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
