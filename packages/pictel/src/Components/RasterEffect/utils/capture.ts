import { snapdom } from "@zumer/snapdom";

const baseOptions = { dpr: 1, fast: true };

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

export async function captureWrapper(element: HTMLElement, dimensions: { width: number; height: number }): Promise<ImageData> {
	const fast = tryFastPath(element, dimensions);

	if (fast) return fast;

	const options = { ...baseOptions, width: dimensions.width, height: dimensions.height };
	const canvas = await snapdom.toCanvas(element, options);
	const context = canvas.getContext("2d", { willReadFrequently: true });

	if (!context) throw new Error("Failed to get 2d context from canvas");

	return context.getImageData(0, 0, canvas.width, canvas.height);
}
