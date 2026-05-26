import { snapdom } from "@zumer/snapdom";

const baseOptions = { dpr: 1, fast: true };

/**
 * Direct pictel-child fast path. When `element` (the children wrapper of
 * some raster effect) contains exactly one paint-emitting element and that
 * element is a `<canvas data-pictel-raster>` matching the requested
 * dimensions, read its pixels directly via `getImageData` instead of
 * going through snapdom.
 *
 * With RasterEffect collapsed to a `display: block` wrapper + conditional
 * canvas sibling, a resolved inner RasterEffect contributes TWO siblings to
 * the outer's children wrapper: a `display: none` div (the inner's hidden
 * children) and the inner's `<canvas data-pictel-raster>`. The walker
 * therefore skips `display: none` elements and looks for exactly one
 * raster canvas. A mid-recapture inner RasterEffect has its wrapper at
 * `display: block` with painted children but no sibling canvas — that
 * shape returns null (slow path), which is correct: snapdom captures the
 * in-flow children. The outer's registry gate would normally not have
 * proceeded while the inner is pending; this branch is the defense in
 * depth.
 *
 * The dim match is unconditional: a stale inner canvas at any other dims
 * would propagate wrong pixels upward.
 */
function tryFastPath(element: HTMLElement, dimensions: { width: number; height: number }): ImageData | null {
	let canvas: HTMLCanvasElement | null = null;

	for (const child of Array.from(element.children)) {
		if (child instanceof HTMLCanvasElement && child.hasAttribute("data-pictel-raster")) {
			if (canvas !== null) return null;

			canvas = child;

			continue;
		}

		if (child instanceof HTMLElement && child.style.display === "none") {
			continue;
		}

		return null;
	}

	if (canvas === null) return null;

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
