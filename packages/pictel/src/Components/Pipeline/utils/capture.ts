import { snapdom } from "@zumer/snapdom";
import { getElementsInFront, type StackingOrder } from "../../../utils/stacking";

const baseOptions = { dpr: 1, fast: true };

export async function captureChildren(element: HTMLElement, dimensions: { width: number; height: number } | null): Promise<ImageData> {
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
	isDisposed?: () => boolean,
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
		// If the caller was disposed while snapdom was pending, skip the
		// visibility restore: the snapshotted "previous" values are stale and
		// writing them back would clobber state belonging to a subsequent
		// mount's in-flight captureBehind (StrictMode double-mount race).
		if (!isDisposed?.()) {
			for (let elementIndex = 0; elementIndex < allToHide.length; elementIndex++) {
				const hidden = allToHide[elementIndex];
				const previous = previousVisibilities[elementIndex];

				if (hidden && previous !== undefined) {
					hidden.style.visibility = previous;
				}
			}
		}
	}
}
