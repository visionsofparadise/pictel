// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";

type RasterCallback = (childPixels: ImageData) => void;

const mockUseRaster = vi.fn<(effect: RasterCallback) => React.RefObject<HTMLDivElement | null>>();

vi.mock("../hooks/useRaster", () => ({
	useRaster: (...args: Parameters<typeof mockUseRaster>) => mockUseRaster(...args),
}));

vi.mock("./PixelCanvas", () => ({
	PixelCanvas: ({ data }: { data: ImageData }) =>
		createElement("canvas", { "data-testid": "pixel-canvas", "data-width": data.width }),
}));

// globalThis.IS_REACT_ACT_ENVIRONMENT is required for React 19 act() support
declare const globalThis: { IS_REACT_ACT_ENVIRONMENT: boolean };
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let capturedCallback: RasterCallback;
const mockRef = { current: null as HTMLDivElement | null };

beforeEach(() => {
	mockUseRaster.mockImplementation((effect) => {
		capturedCallback = effect;
		return mockRef;
	});
});

function makeImageData(width = 2, height = 2): ImageData {
	return { data: new Uint8ClampedArray(width * height * 4), width, height, colorSpace: "srgb" } as ImageData;
}

function renderInto(container: HTMLElement, element: ReactNode) {
	const root = createRoot(container);
	act(() => root.render(element));
	return root;
}

describe("RasterEffect", () => {
	it("renders children div when no result, switches to PixelCanvas when effect resolves", async () => {
		const { RasterEffect } = await import("./RasterEffect");

		const container = document.createElement("div");
		const effect = vi.fn((pixels: ImageData) => makeImageData(pixels.width, pixels.height));

		renderInto(
			container,
			createElement(RasterEffect, { effect }, createElement("span", null, "child")),
		);

		// Before effect resolves: div with children is rendered
		expect(container.querySelector("div")).not.toBeNull();
		expect(container.querySelector("span")?.textContent).toBe("child");
		expect(container.querySelector("canvas")).toBeNull();

		// Simulate pipeline execution by invoking the captured callback
		const resultData = makeImageData(4, 4);
		await act(async () => {
			await capturedCallback(resultData);
		});

		// After effect resolves: PixelCanvas rendered instead of children div
		expect(container.querySelector("[data-testid='pixel-canvas']")).not.toBeNull();
		expect(container.querySelector("span")).toBeNull();
	});

	it("resets result to null when effect prop changes", async () => {
		const { RasterEffect } = await import("./RasterEffect");

		const container = document.createElement("div");
		const effect1 = vi.fn((pixels: ImageData) => makeImageData(pixels.width, pixels.height));

		const root = renderInto(
			container,
			createElement(RasterEffect, { effect: effect1 }, createElement("span", null, "child")),
		);

		// Resolve the first effect
		const resultData = makeImageData(4, 4);
		await act(async () => {
			await capturedCallback(resultData);
		});

		// PixelCanvas should be showing
		expect(container.querySelector("[data-testid='pixel-canvas']")).not.toBeNull();

		// Change effect prop to a new function reference
		const effect2 = vi.fn((pixels: ImageData) => makeImageData(pixels.width, pixels.height));
		act(() => {
			root.render(
				createElement(RasterEffect, { effect: effect2 }, createElement("span", null, "child")),
			);
		});

		// Result should be invalidated — back to children div
		expect(container.querySelector("[data-testid='pixel-canvas']")).toBeNull();
		expect(container.querySelector("span")?.textContent).toBe("child");
	});
});
