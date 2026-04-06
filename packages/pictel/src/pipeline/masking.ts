const MASK_ID_PREFIX = "pictel-mask-";

function generateMaskId(): string {
	return crypto.randomUUID();
}

interface TrackedElement {
	readonly svgMask: SVGMaskElement;
	rect: DOMRect;
}

export interface MaskState {
	readonly tracked: Map<HTMLElement, TrackedElement>;
	svgContainer: SVGElement | null;
	canvasRect: DOMRect | null;
}

export function createMaskState(): MaskState {
	return {
		tracked: new Map(),
		svgContainer: null,
		canvasRect: null,
	};
}

function ensureSvgContainer(canvasRoot: HTMLElement, state: MaskState): SVGElement {
	if (state.svgContainer && canvasRoot.contains(state.svgContainer)) {
		return state.svgContainer;
	}

	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

	svg.setAttribute("width", "0");
	svg.setAttribute("height", "0");
	svg.style.position = "absolute";
	svg.style.pointerEvents = "none";

	const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

	svg.appendChild(defs);
	canvasRoot.appendChild(svg);
	state.svgContainer = svg;

	return svg;
}

function createSvgMask(container: SVGElement): SVGMaskElement {
	const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
	const id = `${MASK_ID_PREFIX}${generateMaskId()}`;

	mask.setAttribute("id", id);
	mask.setAttribute("maskContentUnits", "userSpaceOnUse");

	const whiteRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

	whiteRect.setAttribute("width", "100%");
	whiteRect.setAttribute("height", "100%");
	whiteRect.setAttribute("fill", "white");
	mask.appendChild(whiteRect);

	const defs = container.querySelector("defs");

	if (defs) {
		defs.appendChild(mask);
	}

	return mask;
}

function applyMaskStyle(element: HTMLElement, maskId: string): void {
	const existing = element.style.maskImage || element.style.getPropertyValue("-webkit-mask-image");

	if (existing) {
		element.style.maskImage = `${existing}, url(#${maskId})`;

		const existingComposite = element.style.maskComposite || element.style.getPropertyValue("-webkit-mask-composite");
		element.style.maskComposite = existingComposite ? `${existingComposite}, intersect` : "intersect";
	} else {
		element.style.maskImage = `url(#${maskId})`;
	}
}

function stripMaskStyle(element: HTMLElement): void {
	const maskImage = element.style.maskImage;

	if (!maskImage) return;

	const layers = maskImage.split(",").map((layer) => layer.trim());
	const compositeValue = element.style.maskComposite;
	const compositeLayers = compositeValue ? compositeValue.split(",").map((layer) => layer.trim()) : [];

	const filteredLayers: Array<string> = [];
	const filteredComposite: Array<string> = [];

	for (let ix = 0; ix < layers.length; ix++) {
		const layer = layers[ix];

		if (layer && !layer.includes(MASK_ID_PREFIX)) {
			filteredLayers.push(layer);

			const compositeLayer = compositeLayers[ix];

			if (compositeLayer) {
				filteredComposite.push(compositeLayer);
			}
		}
	}

	if (filteredLayers.length > 0) {
		element.style.maskImage = filteredLayers.join(", ");
		element.style.maskComposite = filteredComposite.length > 0 ? filteredComposite.join(", ") : "";
	} else {
		element.style.maskImage = "";
		element.style.maskComposite = "";
	}
}

function track(element: HTMLElement, rect: DOMRect, state: MaskState, container: SVGElement): void {
	const svgMask = createSvgMask(container);

	const maskId = svgMask.getAttribute("id");

	if (!maskId) return;

	state.tracked.set(element, { svgMask, rect });
	applyMaskStyle(element, maskId);
}

interface SetupResult {
	readonly rects: ReadonlyMap<HTMLElement, DOMRect>;
	readonly elements: Array<HTMLElement>;
}

export function setupMasks(canvasRoot: HTMLElement, state: MaskState): SetupResult {
	const container = ensureSvgContainer(canvasRoot, state);

	state.canvasRect = canvasRoot.getBoundingClientRect();

	const rects = new Map<HTMLElement, DOMRect>();
	const elements: Array<HTMLElement> = [canvasRoot];
	const descendants = canvasRoot.querySelectorAll("*");

	for (const descendant of descendants) {
		if (state.svgContainer && (descendant === state.svgContainer || state.svgContainer.contains(descendant))) continue;

		const element = descendant as HTMLElement;
		const rect = element.getBoundingClientRect();

		track(element, rect, state, container);
		rects.set(element, rect);
		elements.push(element);
	}

	rects.set(canvasRoot, state.canvasRect);

	return { rects, elements };
}

export function teardownMasks(state: MaskState): void {
	for (const [element] of state.tracked) {
		stripMaskStyle(element);
	}

	if (state.svgContainer) {
		state.svgContainer.remove();
	}

	state.tracked.clear();
	state.svgContainer = null;
	state.canvasRect = null;
}

export function applyCutout(behindElement: HTMLElement, sourceRect: DOMRect, state: MaskState): void {
	const entry = state.tracked.get(behindElement);

	if (!entry || !state.canvasRect) return;

	const blackRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

	blackRect.setAttribute("x", String(sourceRect.left - state.canvasRect.left));
	blackRect.setAttribute("y", String(sourceRect.top - state.canvasRect.top));
	blackRect.setAttribute("width", String(sourceRect.width));
	blackRect.setAttribute("height", String(sourceRect.height));
	blackRect.setAttribute("fill", "black");

	entry.svgMask.appendChild(blackRect);
}
