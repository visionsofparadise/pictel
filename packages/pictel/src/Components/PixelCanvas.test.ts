// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createElement, act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { PixelCanvas } from "./PixelCanvas";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
const putImageData = vi.fn();

beforeEach(() => {
	putImageData.mockClear();

	vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
		putImageData,
	} as unknown as CanvasRenderingContext2D);

	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
	vi.restoreAllMocks();
});

function createImageData(width: number, height: number): ImageData {
	const data = new Uint8ClampedArray(width * height * 4);
	return { data, width, height, colorSpace: "srgb" } as ImageData;
}

describe("PixelCanvas", () => {
	it("sets canvas buffer dimensions to match ImageData", () => {
		const data = createImageData(10, 20);

		act(() => root.render(createElement(PixelCanvas, { data })));

		const canvas = container.querySelector("canvas")!;
		expect(canvas.width).toBe(10);
		expect(canvas.height).toBe(20);
	});

	it("calls putImageData with the provided ImageData at origin", () => {
		const data = createImageData(10, 20);

		act(() => root.render(createElement(PixelCanvas, { data })));

		expect(putImageData).toHaveBeenCalledOnce();
		expect(putImageData).toHaveBeenCalledWith(data, 0, 0);
	});
});
