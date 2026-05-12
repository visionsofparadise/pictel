import { snapdom } from "@zumer/snapdom";

const baseOptions = { dpr: 1, fast: true };

/**
 * Direct pipeline child fast path. When `element` (the children wrapper of
 * some pipeline) contains exactly one child and that child is a resolved
 * pictel pipeline whose canvas matches the requested dimensions, read its
 * pixels directly via getImageData instead of going through snapdom.
 *
 * The dim match is unconditional: a transient/stale inner canvas at HTML
 * default 300×150 (e.g., pending was prematurely cleared by a StrictMode
 * race) would propagate wrong dims upward; returning null forces snapdom
 * to run at the requested dims.
 */
function tryFastPath(element: HTMLElement, dimensions: { width: number; height: number }): ImageData | null {
	if (element.children.length !== 1) return null;

	const inner = element.children[0];

	if (!(inner instanceof HTMLElement)) return null;

	if (!inner.hasAttribute("data-pictel-pipeline")) return null;

	if (inner.hasAttribute("data-pictel-pending")) return null;

	const canvas = inner.querySelector<HTMLCanvasElement>(":scope > [data-pictel-raster] > canvas");

	if (!(canvas instanceof HTMLCanvasElement)) return null;

	if (canvas.width !== dimensions.width || canvas.height !== dimensions.height) {
		return null;
	}

	const innerContext = canvas.getContext("2d", { willReadFrequently: true });

	if (!innerContext) return null;

	return innerContext.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Capture a pipeline wrapper (children, apply, or map) as ImageData. Uses the
 * fast path when the wrapper contains a single resolved pictel pipeline whose
 * canvas matches the requested dimensions; falls back to snapdom otherwise.
 */
export async function captureWrapper(element: HTMLElement, dimensions: { width: number; height: number }): Promise<ImageData> {
	const fast = tryFastPath(element, dimensions);

	if (fast) return fast;

	const options = { ...baseOptions, width: dimensions.width, height: dimensions.height };
	const canvas = await snapdom.toCanvas(element, options);
	const context = canvas.getContext("2d", { willReadFrequently: true });

	if (!context) throw new Error("Failed to get 2d context from canvas");

	return context.getImageData(0, 0, canvas.width, canvas.height);
}
