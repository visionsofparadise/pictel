function isDirectlyOwned(element: Element, boundary: Element): boolean {
	let current = element.parentElement;

	while (current && current !== boundary) {
		if (current instanceof HTMLElement && current.style.display === "none") return false;

		const sibling = current.nextElementSibling;

		if (
			sibling instanceof HTMLCanvasElement &&
			sibling.hasAttribute("data-pictel-raster")
		) {
			return false;
		}

		current = current.parentElement;
	}

	return current === boundary;
}

export function getOwnUnloadedImages(boundary: Element): Array<HTMLImageElement> {
	const images = boundary.querySelectorAll("img");
	const unloaded: Array<HTMLImageElement> = [];

	for (const img of images) {
		if (!img.complete && isDirectlyOwned(img, boundary)) {
			unloaded.push(img);
		}
	}

	return unloaded;
}

/**
 * Returns every directly-owned `<img>` in the boundary regardless of load
 * state. Used by `RasterEffect`'s per-mount image cache to populate the
 * map of img → load-state on first gate call, so subsequent gate calls
 * don't re-traverse the subtree.
 */
export function getOwnImages(boundary: Element): Array<HTMLImageElement> {
	const images = boundary.querySelectorAll("img");
	const owned: Array<HTMLImageElement> = [];

	for (const img of images) {
		if (isDirectlyOwned(img, boundary)) owned.push(img);
	}

	return owned;
}
