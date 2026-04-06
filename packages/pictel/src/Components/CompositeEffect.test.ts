import { describe, it, expect, vi } from "vitest";
import type { CompositeEffectCallback } from "../pipeline/graph";

function createMockImageData(tag: string): ImageData {
	return { _tag: tag, data: new Uint8ClampedArray([0, 0, 0, 255]), width: 1, height: 1 } as unknown as ImageData;
}

let capturedCallback: CompositeEffectCallback | undefined;
const mockRef = { current: null };

vi.mock("../hooks/useComposite", () => ({
	useComposite(cb: CompositeEffectCallback) {
		capturedCallback = cb;
		return mockRef;
	},
}));

vi.mock("react", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react")>();
	return {
		...actual,
		useState: (init: unknown) => {
			const value = typeof init === "function" ? (init as () => unknown)() : init;
			return [value, vi.fn()];
		},
	};
});

vi.mock("./PixelCanvas", () => ({
	PixelCanvas: () => null,
}));

describe("CompositeEffect", () => {
	it("passes both self and behind ImageData to the effect callback", async () => {
		capturedCallback = undefined;
		const effect = vi.fn((_self: ImageData, _behind: ImageData) => createMockImageData("result"));

		const { CompositeEffect } = await import("./CompositeEffect");
		CompositeEffect({ effect, children: null });

		expect(capturedCallback).toBeDefined();

		const selfData = createMockImageData("self");
		const behindData = createMockImageData("behind");

		await capturedCallback!(selfData, behindData);

		expect(effect).toHaveBeenCalledOnce();
		expect(effect).toHaveBeenCalledWith(selfData, behindData);
	});

	it("supports async effect callbacks", async () => {
		capturedCallback = undefined;
		const resultData = createMockImageData("async-result");
		const effect = vi.fn(async (_self: ImageData, _behind: ImageData) => resultData);

		const { CompositeEffect } = await import("./CompositeEffect");
		CompositeEffect({ effect, children: null });

		expect(capturedCallback).toBeDefined();

		const selfData = createMockImageData("self");
		const behindData = createMockImageData("behind");

		await capturedCallback!(selfData, behindData);

		expect(effect).toHaveBeenCalledWith(selfData, behindData);
	});
});
