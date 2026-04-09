const MASK_ID_PREFIX = "pictel-mask-";

function generateMaskId(): string {
	return crypto.randomUUID();
}

export function createSvgMask(defs: SVGDefsElement): SVGMaskElement {
	const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
	const maskId = `${MASK_ID_PREFIX}${generateMaskId()}`;

	mask.setAttribute("id", maskId);
	mask.setAttribute("maskContentUnits", "userSpaceOnUse");

	const whiteRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

	whiteRect.setAttribute("width", "100%");
	whiteRect.setAttribute("height", "100%");
	whiteRect.setAttribute("fill", "white");
	mask.appendChild(whiteRect);

	defs.appendChild(mask);

	return mask;
}

/**
 * Returns the shared pictel mask for an element, creating one if it doesn't exist.
 * The mask is applied once to maskImage and never removed — an empty mask
 * (white base rect only) is a visual no-op.
 */
export function ensureSharedMask(element: HTMLElement, defs: SVGDefsElement): SVGMaskElement {
	const existingId = findPictelMaskId(element);

	if (existingId) {
		const existing = document.getElementById(existingId);

		if (existing?.tagName === "mask") return existing as unknown as SVGMaskElement;
	}

	const mask = createSvgMask(defs);
	const maskId = mask.getAttribute("id");

	if (!maskId) throw new Error("createSvgMask did not set an ID");

	applyMaskToElement(element, maskId);

	return mask;
}

function findPictelMaskId(element: HTMLElement): string | null {
	const maskImage = element.style.maskImage;

	if (!maskImage) return null;

	const match = /url\("?#?(pictel-mask-[^")]+)"?\)/.exec(maskImage);

	return match?.[1] ?? null;
}

function applyMaskToElement(element: HTMLElement, maskId: string): void {
	const existing = element.style.maskImage || element.style.getPropertyValue("-webkit-mask-image");

	if (existing) {
		const layers = existing.split(",").map((layer) => layer.trim());
		const compositeValue = element.style.maskComposite || element.style.getPropertyValue("-webkit-mask-composite");
		const compositeLayers = compositeValue ? compositeValue.split(",").map((layer) => layer.trim()) : [];

		// Fill maskComposite to match existing maskImage layer count with CSS defaults
		while (compositeLayers.length < layers.length) {
			compositeLayers.push("add");
		}

		element.style.maskImage = `${existing}, url(#${maskId})`;
		element.style.maskComposite = [...compositeLayers, "intersect"].join(", ");
	} else {
		element.style.maskImage = `url(#${maskId})`;
	}
}

export function addCutout(svgMask: SVGMaskElement, sourceRect: DOMRect, canvasRect: DOMRect): SVGRectElement {
	const blackRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

	blackRect.setAttribute("x", String(sourceRect.left - canvasRect.left));
	blackRect.setAttribute("y", String(sourceRect.top - canvasRect.top));
	blackRect.setAttribute("width", String(sourceRect.width));
	blackRect.setAttribute("height", String(sourceRect.height));
	blackRect.setAttribute("fill", "black");

	svgMask.appendChild(blackRect);

	return blackRect;
}

export function removeCutouts(cutouts: Array<SVGRectElement>): void {
	for (const cutout of cutouts) {
		cutout.remove();
	}
}
