// @vitest-environment jsdom

import { describe, it, expect, afterEach } from "vitest";
import { getOwnImages } from "./scope";

function rasterCanvas(): HTMLCanvasElement {
	const canvas = document.createElement("canvas");
	canvas.setAttribute("data-pictel-raster", "");

	return canvas;
}

afterEach(() => {
	document.body.replaceChildren();
});

describe("getOwnImages", () => {
	it("returns images directly owned by the boundary", () => {
		const boundary = document.createElement("div");
		const wrapper = document.createElement("div");
		const img = document.createElement("img");
		wrapper.appendChild(img);
		boundary.appendChild(wrapper);
		document.body.appendChild(boundary);

		expect(getOwnImages(boundary)).toEqual([img]);
	});

	it("returns every owned image, regardless of load state", () => {
		const boundary = document.createElement("div");
		const first = document.createElement("img");
		const second = document.createElement("img");
		boundary.append(first, second);
		document.body.appendChild(boundary);

		expect(getOwnImages(boundary)).toEqual([first, second]);
	});

	it("returns an empty array when the boundary owns no images", () => {
		const boundary = document.createElement("div");
		boundary.appendChild(document.createElement("span"));
		document.body.appendChild(boundary);

		expect(getOwnImages(boundary)).toEqual([]);
	});

	it("excludes an image hidden behind a display:none ancestor", () => {
		const boundary = document.createElement("div");
		const hidden = document.createElement("div");
		hidden.style.display = "none";
		const img = document.createElement("img");
		hidden.appendChild(img);
		boundary.appendChild(hidden);
		document.body.appendChild(boundary);

		expect(getOwnImages(boundary)).toEqual([]);
	});

	it("excludes an image whose ancestor is superseded by a sibling raster canvas", () => {
		// A nested RasterEffect has already rasterized this subtree: its
		// output canvas sits as the next sibling, so the image is owned by the
		// inner effect, not this boundary. Walking up from the image, the
		// wrapper's nextElementSibling is that [data-pictel-raster] canvas.
		const boundary = document.createElement("div");
		const wrapper = document.createElement("div");
		const img = document.createElement("img");
		wrapper.appendChild(img);
		boundary.append(wrapper, rasterCanvas());
		document.body.appendChild(boundary);

		expect(getOwnImages(boundary)).toEqual([]);
	});

	it("owns an image that sits directly under the boundary (empty walk)", () => {
		const boundary = document.createElement("div");
		const img = document.createElement("img");
		boundary.appendChild(img);
		document.body.appendChild(boundary);

		expect(getOwnImages(boundary)).toEqual([img]);
	});
});
