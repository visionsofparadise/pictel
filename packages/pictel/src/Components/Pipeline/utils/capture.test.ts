// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from "vitest";
import { captureChildren, captureBehind } from "./capture";
import type { StackingOrder } from "../../../utils/stacking";

const mockGetImageData = vi.fn();
const mockToCanvas = vi.fn();
const mockGetElementsInFront = vi.fn();

vi.mock("@zumer/snapdom", () => ({
	snapdom: {
		toCanvas: (...args: Array<unknown>) => mockToCanvas(...args),
	},
}));

vi.mock("../../../utils/stacking", async (importOriginal) => {
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
	let element: HTMLElement;

	beforeEach(() => {
		vi.clearAllMocks();
		element = {
			outerHTML: "<div><div>test</div></div>",
			children: [] as unknown as HTMLCollection,
		} as unknown as HTMLElement;

		const imageData = createMockImageData();
		mockGetImageData.mockReturnValue(imageData);
		mockToCanvas.mockResolvedValue({
			getContext: () => ({ getImageData: mockGetImageData }),
			width: 100,
			height: 100,
		});
	});

	it("calls snapdom with dpr:1 and fast:true", async () => {
		const result = await captureChildren(element, { width: 100, height: 100 });

		expect(mockToCanvas).toHaveBeenCalledWith(element, { dpr: 1, fast: true, width: 100, height: 100 });
		expect(result).toBeDefined();
	});

	it("omits size options when dimensions are null", async () => {
		await captureChildren(element, null);

		expect(mockToCanvas).toHaveBeenCalledWith(element, { dpr: 1, fast: true });
	});
});

describe("captureBehind", () => {
	let element: HTMLElement;
	let canvasRoot: HTMLElement;
	let stackingOrder: StackingOrder;
	let rects: Map<HTMLElement, DOMRect>;

	beforeEach(() => {
		vi.clearAllMocks();
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
		await captureBehind(element, canvasRoot, null, stackingOrder, rects);

		expect(element.style.visibility).toBe("");
	});

	it("hides elements in front during capture", async () => {
		const inFrontElement = {
			style: { visibility: "" },
		} as unknown as HTMLElement;
		mockGetElementsInFront.mockReturnValue([inFrontElement]);

		await captureBehind(element, canvasRoot, null, stackingOrder, rects);

		expect(element.style.visibility).toBe("");
		expect(inFrontElement.style.visibility).toBe("");
	});

	it("clips to element bounding region", async () => {
		await captureBehind(element, canvasRoot, null, stackingOrder, rects);

		expect(mockGetImageData).toHaveBeenCalledWith(10, 10, 50, 50);
	});

	it("restores visibility when snapdom throws", async () => {
		element.style.visibility = "visible";
		const inFrontElement = {
			style: { visibility: "visible" },
		} as unknown as HTMLElement;
		mockGetElementsInFront.mockReturnValue([inFrontElement]);
		mockToCanvas.mockRejectedValueOnce(new Error("snapdom failure"));

		await expect(captureBehind(element, canvasRoot, null, stackingOrder, rects)).rejects.toThrow("snapdom failure");
		expect(element.style.visibility).toBe("visible");
		expect(inFrontElement.style.visibility).toBe("visible");
	});
});
