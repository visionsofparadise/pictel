import { snapdom } from "@zumer/snapdom";
import { getElementsInFront, type StackingOrder } from "./stacking";

export type CaptureCache = Map<string, ImageData>;

function djb2(input: string): string {
	let hash = 5381;

	for (let ci = 0; ci < input.length; ci++) {
		hash = (hash * 33) ^ input.charCodeAt(ci);
	}

	return (hash >>> 0).toString(36);
}

export async function captureChildren(element: HTMLElement, dimensions: { width: number; height: number } | null, cache: CaptureCache): Promise<ImageData> {
	const serialized = element.outerHTML;
	const hash = djb2(serialized);

	const cached = cache.get(hash);

	if (cached) return cached;

	const options = dimensions ? { width: dimensions.width, height: dimensions.height } : {};
	const canvas = await snapdom.toCanvas(element, options);
	const context = canvas.getContext("2d");

	if (!context) throw new Error("Failed to get 2d context from canvas");

	const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

	cache.set(hash, imageData);

	return imageData;
}

export async function captureBehind(
	element: HTMLElement,
	canvasRoot: HTMLElement,
	dimensions: { width: number; height: number } | null,
	cache: CaptureCache,
	stackingOrder: StackingOrder,
	rects: ReadonlyMap<HTMLElement, DOMRect>,
): Promise<ImageData> {
	const rootHash = djb2(canvasRoot.outerHTML);
	const targetHash = djb2(element.outerHTML);
	const hash = `${rootHash}|${targetHash}`;

	const cached = cache.get(hash);

	if (cached) return cached;

	const inFront = getElementsInFront(element, stackingOrder, rects);
	const allToHide = [element, ...inFront];

	const previousVisibilities = allToHide.map((hidden) => hidden.style.visibility);

	for (const hidden of allToHide) {
		hidden.style.visibility = "hidden";
	}

	try {
		const options = dimensions ? { width: dimensions.width, height: dimensions.height } : {};
		const canvas = await snapdom.toCanvas(canvasRoot, options);
		const context = canvas.getContext("2d");

		if (!context) throw new Error("Failed to get 2d context from canvas");

		const rect = element.getBoundingClientRect();
		const rootRect = canvasRoot.getBoundingClientRect();

		const offsetX = rect.left - rootRect.left;
		const offsetY = rect.top - rootRect.top;
		const width = rect.width;
		const height = rect.height;

		const imageData = context.getImageData(offsetX, offsetY, width, height);
		cache.set(hash, imageData);

		return imageData;
	} finally {
		for (let ix = 0; ix < allToHide.length; ix++) {
			const hidden = allToHide[ix];
			const previous = previousVisibilities[ix];

			if (hidden && previous !== undefined) {
				hidden.style.visibility = previous;
			}
		}
	}
}
