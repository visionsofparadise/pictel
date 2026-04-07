// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from "vitest";
import { captureChildren, captureBehind, partitionChildren, type CaptureCache } from "./capture";
import type { StackingOrder } from "./stacking";

const mockGetImageData = vi.fn();
const mockToCanvas = vi.fn();
const mockGetElementsInFront = vi.fn();

vi.mock("@zumer/snapdom", () => ({
	snapdom: {
		toCanvas: (...args: Array<unknown>) => mockToCanvas(...args),
	},
}));

vi.mock("./stacking", async (importOriginal) => {
	const original = await importOriginal();
	return {
		...(original as Record<string, unknown>),
		getElementsInFront: (...args: Array<unknown>) => mockGetElementsInFront(...args),
	};
});

function createMockImageData(): ImageData {
	return { data: new Uint8ClampedArray([255, 0, 0, 255]), width: 1, height: 1 } as unknown as ImageData;
}

function createMockStackingOrder(): StackingOrder {
	return { order: [], indexOf: new Map() };
}

describe("captureChildren", () => {
	let cache: CaptureCache;
	let element: HTMLElement;

	beforeEach(() => {
		vi.clearAllMocks();
		cache = new Map();
		element = { outerHTML: "<div><div>test</div></div>" } as unknown as HTMLElement;

		const imageData = createMockImageData();
		mockGetImageData.mockReturnValue(imageData);
		mockToCanvas.mockResolvedValue({
			getContext: () => ({ getImageData: mockGetImageData }),
			width: 100,
			height: 100,
		});
	});

	it("calls snapdom and populates cache on first capture", async () => {
		const result = await captureChildren(element, { width: 100, height: 100 }, cache);

		expect(mockToCanvas).toHaveBeenCalledWith(element, { width: 100, height: 100 });
		expect(result).toBeDefined();
		expect(cache.size).toBe(1);
	});

	it("returns cached result without calling snapdom on identical content", async () => {
		await captureChildren(element, { width: 100, height: 100 }, cache);
		mockToCanvas.mockClear();

		const result = await captureChildren(element, { width: 100, height: 100 }, cache);

		expect(mockToCanvas).not.toHaveBeenCalled();
		expect(result).toBeDefined();
	});

	it("misses cache when outerHTML changes", async () => {
		await captureChildren(element, null, cache);
		mockToCanvas.mockClear();

		element = { outerHTML: "<div><div>changed</div></div>" } as unknown as HTMLElement;
		await captureChildren(element, null, cache);

		expect(mockToCanvas).toHaveBeenCalledOnce();
	});

	it("omits size options when dimensions are null", async () => {
		await captureChildren(element, null, cache);

		expect(mockToCanvas).toHaveBeenCalledWith(element, {});
	});
});

describe("captureBehind", () => {
	let cache: CaptureCache;
	let element: HTMLElement;
	let canvasRoot: HTMLElement;
	let stackingOrder: StackingOrder;
	let rects: Map<HTMLElement, DOMRect>;

	beforeEach(() => {
		vi.clearAllMocks();
		cache = new Map();
		element = {
			outerHTML: "<span>target</span>",
			style: { visibility: "" },
			getBoundingClientRect: vi.fn().mockReturnValue({ left: 10, top: 10, width: 50, height: 50 }),
		} as unknown as HTMLElement;
		canvasRoot = {
			outerHTML: "<div><span>target</span><p>other</p></div>",
			getBoundingClientRect: vi.fn().mockReturnValue({ left: 0, top: 0 }),
		} as unknown as HTMLElement;
		stackingOrder = createMockStackingOrder();
		rects = new Map();

		mockGetElementsInFront.mockReturnValue([]);

		const imageData = createMockImageData();
		mockGetImageData.mockReturnValue(imageData);
		mockToCanvas.mockResolvedValue({
			getContext: () => ({ getImageData: mockGetImageData }),
			width: 100,
			height: 100,
		});
	});

	it("hides element, captures, then restores visibility", async () => {
		await captureBehind(element, canvasRoot, null, cache, stackingOrder, rects);

		expect(element.style.visibility).toBe("");
	});

	it("hides elements in front during capture", async () => {
		const inFrontElement = {
			style: { visibility: "" },
		} as unknown as HTMLElement;
		mockGetElementsInFront.mockReturnValue([inFrontElement]);

		await captureBehind(element, canvasRoot, null, cache, stackingOrder, rects);

		expect(element.style.visibility).toBe("");
		expect(inFrontElement.style.visibility).toBe("");
	});

	it("excludes target element from cache hash", async () => {
		await captureBehind(element, canvasRoot, null, cache, stackingOrder, rects);
		mockToCanvas.mockClear();

		// Same content, same target — should hit cache
		await captureBehind(element, canvasRoot, null, cache, stackingOrder, rects);
		expect(mockToCanvas).not.toHaveBeenCalled();
	});

	it("clips to element bounding region", async () => {
		await captureBehind(element, canvasRoot, null, cache, stackingOrder, rects);

		expect(mockGetImageData).toHaveBeenCalledWith(10, 10, 50, 50);
	});

	it("restores visibility when snapdom throws", async () => {
		element.style.visibility = "visible";
		const inFrontElement = {
			style: { visibility: "visible" },
		} as unknown as HTMLElement;
		mockGetElementsInFront.mockReturnValue([inFrontElement]);
		mockToCanvas.mockRejectedValueOnce(new Error("snapdom failure"));

		await expect(captureBehind(element, canvasRoot, null, cache, stackingOrder, rects)).rejects.toThrow("snapdom failure");
		expect(element.style.visibility).toBe("visible");
		expect(inFrontElement.style.visibility).toBe("visible");
	});
});

describe("partitionChildren", () => {
	it("partitions mixed children into maps and content", () => {
		const container = document.createElement("div");
		const mapChild = document.createElement("div");
		mapChild.setAttribute("data-pictel-map", "");
		const contentChild = document.createElement("div");
		container.appendChild(mapChild);
		container.appendChild(contentChild);

		const { mapElements, contentElements } = partitionChildren(container);

		expect(mapElements).toEqual([mapChild]);
		expect(contentElements).toEqual([contentChild]);
	});

	it("returns all content when no maps are present", () => {
		const container = document.createElement("div");
		const child1 = document.createElement("div");
		const child2 = document.createElement("span");
		container.appendChild(child1);
		container.appendChild(child2);

		const { mapElements, contentElements } = partitionChildren(container);

		expect(mapElements).toHaveLength(0);
		expect(contentElements).toEqual([child1, child2]);
	});

	it("returns all maps when no content is present", () => {
		const container = document.createElement("div");
		const map1 = document.createElement("div");
		map1.setAttribute("data-pictel-map", "");
		const map2 = document.createElement("div");
		map2.setAttribute("data-pictel-map", "");
		container.appendChild(map1);
		container.appendChild(map2);

		const { mapElements, contentElements } = partitionChildren(container);

		expect(mapElements).toEqual([map1, map2]);
		expect(contentElements).toHaveLength(0);
	});

	it("detects nested data-pictel-map attribute on a descendant", () => {
		const container = document.createElement("div");
		const wrapper = document.createElement("div");
		const nested = document.createElement("div");
		nested.setAttribute("data-pictel-map", "");
		wrapper.appendChild(nested);
		const contentChild = document.createElement("p");
		container.appendChild(wrapper);
		container.appendChild(contentChild);

		const { mapElements, contentElements } = partitionChildren(container);

		expect(mapElements).toEqual([wrapper]);
		expect(contentElements).toEqual([contentChild]);
	});

	it("returns empty arrays for a container with no children", () => {
		const container = document.createElement("div");

		const { mapElements, contentElements } = partitionChildren(container);

		expect(mapElements).toHaveLength(0);
		expect(contentElements).toHaveLength(0);
	});
});
