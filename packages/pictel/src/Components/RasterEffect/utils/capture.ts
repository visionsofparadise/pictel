import { snapdom } from "@zumer/snapdom";
import type { ImageDataPool } from "../../../utils/image-data-pool";

const baseOptions = { dpr: 1, fast: true };

/**
 * Read pixels into a pool-owned `ImageData`. The pool may hand back a buffer
 * recycled from a prior capture; we overwrite it via `data.set()` so the
 * returned bytes are identical to what `getImageData` produced. The fresh
 * `ImageData` allocated by `getImageData` is GC'd after the copy — short-lived
 * nursery garbage rather than long-lived heap pressure.
 */
function readIntoPool(canvas: HTMLCanvasElement, width: number, height: number, pool: ImageDataPool): ImageData | null {
	const context = canvas.getContext("2d", { willReadFrequently: true });

	if (!context) return null;

	const fresh = context.getImageData(0, 0, width, height);
	const pooled = pool.acquire(width, height);

	if (pooled.data.length !== fresh.data.length) {
		// Pool returned a buffer with mismatched length (defensive — shouldn't
		// happen since acquire matches on width+height). Fall back to the
		// fresh allocation.
		return fresh;
	}

	pooled.data.set(fresh.data);

	return pooled;
}

function tryFastPath(element: HTMLElement, dimensions: { width: number; height: number }, pool: ImageDataPool): ImageData | null {
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

	return readIntoPool(canvas, canvas.width, canvas.height, pool);
}

export async function captureWrapper(element: HTMLElement, dimensions: { width: number; height: number }, pool: ImageDataPool): Promise<ImageData> {
	const fast = tryFastPath(element, dimensions, pool);

	if (fast) return fast;

	const options = { ...baseOptions, width: dimensions.width, height: dimensions.height };
	const canvas = await snapdom.toCanvas(element, options);
	const captured = readIntoPool(canvas, canvas.width, canvas.height, pool);

	if (captured === null) throw new Error("Failed to get 2d context from canvas");

	return captured;
}
