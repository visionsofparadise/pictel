/**
 * Walks ancestors of `element` up to (but not past) the boundary, looking for
 * an intermediate element that signals a nested Pipeline's children wrapper.
 *
 * Post-DOM-collapse, a nested Pipeline contributes a wrapper div (whose
 * `display` is `contents` while pending and `none` once resolved) plus, when
 * resolved, a sibling `<canvas data-pictel-raster>`. Both shapes are detected
 * by the wrapper having a sibling `<canvas data-pictel-raster>` OR by the
 * wrapper itself being `display: none` (a resolved inner's hidden children).
 *
 * An element is "directly owned" by the outer pipeline only if no such
 * boundary lies between it and the outer's children wrapper. In practice
 * `getOwnUnloadedImages` only runs once `selfRegistry.anyPending()` is false,
 * so in-progress nested pipelines are not a concern — only resolved ones
 * with their `display: none` children wrapper.
 */
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

/**
 * Finds unloaded images within the boundary that are not inside a nested
 * pipeline component. Returns the list of images still loading. Used by
 * `gate()` to decide whether to wait for image decode before executing —
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
