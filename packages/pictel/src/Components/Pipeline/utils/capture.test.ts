// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from "vitest";
import { captureWrapper } from "./capture";

const mockGetImageData = vi.fn();
const mockToCanvas = vi.fn();

vi.mock("@zumer/snapdom", () => ({
	snapdom: {
		toCanvas: (...args: Array<unknown>) => mockToCanvas(...args),
	},
}));

function createMockImageData(): ImageData {
	return { data: new Uint8ClampedArray([255, 0, 0, 255]), width: 1, height: 1 } as unknown as ImageData;
}

describe("captureWrapper", () => {
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

	it("calls snapdom with dpr:1, fast:true, and the requested dimensions", async () => {
		const result = await captureWrapper(element, { width: 100, height: 100 });

		expect(mockToCanvas).toHaveBeenCalledWith(element, { dpr: 1, fast: true, width: 100, height: 100 });
		expect(result).toBeDefined();
	});
});
