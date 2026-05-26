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
