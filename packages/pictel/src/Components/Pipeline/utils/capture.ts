import { snapdom } from "@zumer/snapdom";
import { getElementsInFront, type StackingOrder } from "../../../utils/stacking";

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

export async function captureChildren(element: HTMLElement, dimensions: { width: number; height: number }): Promise<ImageData> {
	const fast = tryFastPath(element, dimensions);

	if (fast) return fast;

	const options = { ...baseOptions, width: dimensions.width, height: dimensions.height };
	const canvas = await snapdom.toCanvas(element, options);
	const context = canvas.getContext("2d", { willReadFrequently: true });

	if (!context) throw new Error("Failed to get 2d context from canvas");

	return context.getImageData(0, 0, canvas.width, canvas.height);
}

export async function captureBehind(
	element: HTMLElement,
	canvasRoot: HTMLElement,
	dimensions: { width: number; height: number },
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
		const options = { ...baseOptions, width: dimensions.width, height: dimensions.height };
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
		// Always restore visibility, even on abort. The previous-skip-on-abort
		// approach left descendants stuck `visibility: hidden` when a StrictMode
		// double-mount aborted us mid-snapdom — and a later mount's captureBehind
		// would then snapshot that "hidden" as its `previous`, painting it
		// permanent. The race the skip was guarding against (a sibling mount's
		// in-flight captureBehind reading our restored visibility before its own
		// hide step runs) is moot at our level: the sibling mount runs its own
		// hide-then-restore pair, and the only safe terminal state is "elements
		// are visible" — which is what we restore to.
		for (let elementIndex = 0; elementIndex < allToHide.length; elementIndex++) {
			const hidden = allToHide[elementIndex];
			const previous = previousVisibilities[elementIndex];

			if (hidden && previous !== undefined) {
				hidden.style.visibility = previous;
			}
		}
	}
}
