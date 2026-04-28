/**
 * Checks whether an element is directly owned by a pipeline boundary,
 * meaning there is no intervening `[data-pictel-pipeline]` ancestor
 * between it and the boundary element.
 */
function isDirectlyOwned(element: Element, boundary: Element): boolean {
	let current = element.parentElement;

	while (current && current !== boundary) {
		if (current.hasAttribute("data-pictel-pipeline")) return false;

		current = current.parentElement;
	}

	return current === boundary;
}

/**
 * Finds unloaded images within the boundary that are not inside a nested
 * pipeline component. Returns the list of images still loading. Used by
 * gate() to decide whether to wait for image decode before executing —
 * we only wait for our own images, not images that belong to a nested
 * pipeline (it has its own gate that handles those).
 */
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
