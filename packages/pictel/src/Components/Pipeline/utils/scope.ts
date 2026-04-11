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
 * Returns true if any mutation in the list originated from within this
 * pipeline's own subtree (not inside a nested pipeline boundary).
 * Mutations targeting `ignore` (e.g. the boundary element itself) are skipped
 * to avoid self-triggering from pipeline state changes like visibility toggles.
 */
export function hasOwnMutations(mutations: Array<MutationRecord>, boundary: Element, ignore?: Element): boolean {
	for (const mutation of mutations) {
		const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement;

		if (!target || target === ignore) continue;

		if (isDirectlyOwned(target, boundary)) return true;
	}

	return false;
}

/**
 * Finds unloaded images within the boundary that are not inside a nested
 * pipeline component. Returns the list of images still loading.
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

/**
 * Returns true if any mutation in the list originated OUTSIDE the given
 * element's subtree. Used by CompositeEffect's behind observers to ignore
 * self-triggered mutations — the pipeline element is a descendant of its
 * behind elements (because behind elements include ancestors of the pipeline),
 * so every DOM write the pipeline makes to its own subtree would otherwise
 * fire the behind observer and cause a gate() loop.
 */
export function hasExternalMutations(mutations: Array<MutationRecord>, pipelineElement: Element): boolean {
	for (const mutation of mutations) {
		const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement;

		if (!target) continue;

		if (pipelineElement.contains(target)) continue;

		return true;
	}

	return false;
}
