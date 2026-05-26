// @vitest-environment jsdom

import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { captureWrapper } from "./capture";
import { createImageDataPool } from "../../../utils/image-data-pool";

// jsdom does not expose `ImageData` on the global. Shim a minimal compatible
// class so `new ImageData(data, width, height)` works inside the pool.
beforeAll(() => {
	if (typeof globalThis.ImageData === "undefined") {
		globalThis.ImageData = class ImageData {
			readonly data: Uint8ClampedArray;
			readonly width: number;
			readonly height: number;
			readonly colorSpace = "srgb" as const;

			constructor(data: Uint8ClampedArray, width: number, height: number) {
				this.data = data;
				this.width = width;
				this.height = height;
			}
		} as unknown as typeof globalThis.ImageData;
	}
});

const mockGetImageData = vi.fn();
const mockToCanvas = vi.fn();

vi.mock("@zumer/snapdom", () => ({
	snapdom: {
		toCanvas: (...args: Array<unknown>) => mockToCanvas(...args),
	},
}));

function createMockImageData(width = 100, height = 100): ImageData {
	return new ImageData(new Uint8ClampedArray(width * height * 4).fill(128), width, height);
}

describe("captureWrapper", () => {
	let element: HTMLElement;

	beforeEach(() => {
		vi.clearAllMocks();
		element = {
			outerHTML: "<div><div>test</div></div>",
			children: [] as unknown as HTMLCollection,
		} as unknown as HTMLElement;

		mockGetImageData.mockImplementation((_sx: number, _sy: number, sw: number, sh: number) => createMockImageData(sw, sh));
		mockToCanvas.mockResolvedValue({
			getContext: () => ({ getImageData: mockGetImageData }),
			width: 100,
			height: 100,
		});
	});

	it("calls snapdom with dpr:1, fast:true, and the requested dimensions", async () => {
		const pool = createImageDataPool();
		const result = await captureWrapper(element, { width: 100, height: 100 }, pool);

		expect(mockToCanvas).toHaveBeenCalledWith(element, { dpr: 1, fast: true, width: 100, height: 100 });
		expect(result).toBeDefined();
		expect(result.width).toBe(100);
		expect(result.height).toBe(100);
	});

	it("returns a pool-owned ImageData with bytes identical to the fresh capture", async () => {
		const pool = createImageDataPool();
		const result = await captureWrapper(element, { width: 100, height: 100 }, pool);

		// The fresh capture was filled with 128; the pool buffer must carry
		// those same bytes after the in-pool copy.
		expect(result.data[0]).toBe(128);
		expect(result.data[result.data.length - 1]).toBe(128);
	});
});
