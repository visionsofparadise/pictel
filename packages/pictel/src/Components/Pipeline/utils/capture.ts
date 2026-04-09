import { snapdom } from "@zumer/snapdom";
import { getElementsInFront, type StackingOrder } from "../../../utils/stacking";

const baseOptions = { dpr: 1, fast: true };

/**
 * Tries to capture the element without snapdom by detecting fast-path cases:
 * - Single visible child is a completed pipeline element → read its output canvas directly
 * - Single visible child is a loaded img → draw it to a canvas
 * Returns null if no fast path applies.
 */
function tryFastCapture(element: HTMLElement): ImageData | null {
	let visibleChild: HTMLElement | null = null;

	for (const child of element.children) {
		const style = (child as HTMLElement).style;

		// Skip hidden children and zero-height wrappers (raster/map containers)
		if (style.visibility === "hidden" || style.display === "none") continue;

		if (style.position === "relative" && style.height === "0" || style.height === "0px") continue;

		if (visibleChild !== null) return null; // Multiple visible children — can't fast path

		visibleChild = child as HTMLElement;
	}

	if (!visibleChild) return null;

	// Case 1: single canvas element — read pixels directly
	if (visibleChild.tagName === "CANVAS") {
		const canvas = visibleChild as HTMLCanvasElement;
		const context = canvas.getContext("2d", { willReadFrequently: true });

		if (!context) return null;

		return context.getImageData(0, 0, canvas.width, canvas.height);
	}

	// Case 2: completed pipeline element — navigate to its output canvas
	// Structure: pipeline > ... > rasterWrapper (last child) > rasterDiv > canvas
	if (visibleChild.hasAttribute("data-pictel-pipeline") && !visibleChild.hasAttribute("data-pictel-pending")) {
		const canvas = visibleChild.lastElementChild?.firstElementChild?.firstElementChild;

		if (canvas?.tagName !== "CANVAS") return null;

		const context = (canvas as HTMLCanvasElement).getContext("2d", { willReadFrequently: true });

		if (!context) return null;

		return context.getImageData(0, 0, (canvas as HTMLCanvasElement).width, (canvas as HTMLCanvasElement).height);
	}

	// Case 3: map wrapper — recurse into it
	if (visibleChild.hasAttribute("data-pictel-map")) {
		return tryFastCapture(visibleChild);
	}

	// Case 4: single img element
	if (visibleChild.tagName === "IMG") {
		const img = visibleChild as HTMLImageElement;

		if (!img.complete || img.naturalWidth === 0) return null;

		const rect = img.getBoundingClientRect();
		const width = Math.round(rect.width);
		const height = Math.round(rect.height);

		if (width === 0 || height === 0) return null;

		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext("2d", { willReadFrequently: true });

		if (!context) return null;

		context.drawImage(img, 0, 0, width, height);

		return context.getImageData(0, 0, width, height);
	}

	return null;
}

export async function captureChildren(element: HTMLElement, dimensions: { width: number; height: number } | null): Promise<ImageData> {
	const fast = tryFastCapture(element);

	if (fast) return fast;

	const options = dimensions ? { ...baseOptions, width: dimensions.width, height: dimensions.height } : baseOptions;
	const canvas = await snapdom.toCanvas(element, options);
	const context = canvas.getContext("2d", { willReadFrequently: true });

	if (!context) throw new Error("Failed to get 2d context from canvas");

	return context.getImageData(0, 0, canvas.width, canvas.height);
}

export async function captureBehind(
	element: HTMLElement,
	canvasRoot: HTMLElement,
	dimensions: { width: number; height: number } | null,
	stackingOrder: StackingOrder,
	rects: ReadonlyMap<HTMLElement, DOMRect>,
): Promise<ImageData> {
	const inFront = getElementsInFront(element, stackingOrder, rects);
	const allToHide = [element, ...inFront];

	const previousVisibilities = allToHide.map((hidden) => hidden.style.visibility);

	for (const hidden of allToHide) {
		hidden.style.visibility = "hidden";
	}

	try {
		const options = dimensions ? { ...baseOptions, width: dimensions.width, height: dimensions.height } : baseOptions;
		const canvas = await snapdom.toCanvas(canvasRoot, options);
		const context = canvas.getContext("2d", { willReadFrequently: true });

		if (!context) throw new Error("Failed to get 2d context from canvas");

		const rect = element.getBoundingClientRect();
		const rootRect = canvasRoot.getBoundingClientRect();

		const offsetX = rect.left - rootRect.left;
		const offsetY = rect.top - rootRect.top;
		const width = rect.width;
		const height = rect.height;

		return context.getImageData(offsetX, offsetY, width, height);
	} finally {
		for (let elementIndex = 0; elementIndex < allToHide.length; elementIndex++) {
			const hidden = allToHide[elementIndex];
			const previous = previousVisibilities[elementIndex];

			if (hidden && previous !== undefined) {
				hidden.style.visibility = previous;
			}
		}
	}
}
