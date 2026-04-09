// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import {
	addCutout,
	createSvgMask,
	ensureSharedMask,
	removeCutouts,
} from "./masking";

describe("masking", () => {
	let defs: SVGDefsElement;

	beforeEach(() => {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

		defs = document.createElementNS("http://www.w3.org/2000/svg", "defs") as SVGDefsElement;
		svg.appendChild(defs);
		document.body.appendChild(svg);
	});

	describe("createSvgMask", () => {
		it("creates mask element with pictel-mask-* ID prefix", () => {
			const mask = createSvgMask(defs);

			expect(mask.tagName).toBe("mask");
			expect(mask.getAttribute("id")).toMatch(/^pictel-mask-.+/);
		});

		it("has maskContentUnits userSpaceOnUse", () => {
			const mask = createSvgMask(defs);

			expect(mask.getAttribute("maskContentUnits")).toBe("userSpaceOnUse");
		});

		it("contains white base rect", () => {
			const mask = createSvgMask(defs);
			const baseRect = mask.querySelector("rect");

			expect(baseRect).not.toBeNull();
			expect(baseRect?.getAttribute("fill")).toBe("white");
			expect(baseRect?.getAttribute("width")).toBe("100%");
			expect(baseRect?.getAttribute("height")).toBe("100%");
		});

		it("appends mask to defs element", () => {
			const mask = createSvgMask(defs);

			expect(defs.contains(mask)).toBe(true);
		});
	});

	describe("ensureSharedMask", () => {
		it("creates a new mask and applies maskImage on first call", () => {
			const element = document.createElement("div");

			document.body.appendChild(element);

			const mask = ensureSharedMask(element, defs);

			expect(mask.tagName).toBe("mask");
			expect(element.style.maskImage).toContain("pictel-mask-");
		});

		it("returns existing mask on subsequent calls", () => {
			const element = document.createElement("div");

			document.body.appendChild(element);

			const first = ensureSharedMask(element, defs);
			const second = ensureSharedMask(element, defs);

			expect(first).toBe(second);
		});

		it("appends to existing maskImage and fills maskComposite with defaults", () => {
			const element = document.createElement("div");

			document.body.appendChild(element);

			element.style.maskImage = "url(#user-mask)";
			element.style.maskComposite = "subtract";

			ensureSharedMask(element, defs);

			expect(element.style.maskImage).toContain("user-mask");
			expect(element.style.maskImage).toContain("pictel-mask-");

			const compositeLayers = element.style.maskComposite.split(",").map((layer) => layer.trim());

			expect(compositeLayers).toEqual(["subtract", "intersect"]);
		});

		it("fills missing maskComposite values with add before appending intersect", () => {
			const element = document.createElement("div");

			document.body.appendChild(element);

			element.style.maskImage = "url(#a), url(#b), url(#c)";

			ensureSharedMask(element, defs);

			const compositeLayers = element.style.maskComposite.split(",").map((layer) => layer.trim());

			expect(compositeLayers).toEqual(["add", "add", "add", "intersect"]);
		});

		it("does not set maskComposite when element has no existing maskImage", () => {
			const element = document.createElement("div");

			document.body.appendChild(element);

			ensureSharedMask(element, defs);

			expect(element.style.maskComposite).toBe("");
		});
	});

	describe("addCutout", () => {
		it("adds black rect to SVG mask at correct position", () => {
			const mask = createSvgMask(defs);

			const sourceRect = new DOMRect(110, 220, 100, 50);
			const canvasRect = new DOMRect(10, 20, 800, 600);

			const cutout = addCutout(mask, sourceRect, canvasRect);

			expect(cutout.getAttribute("fill")).toBe("black");
			expect(cutout.getAttribute("x")).toBe("100"); // 110 - 10
			expect(cutout.getAttribute("y")).toBe("200"); // 220 - 20
			expect(cutout.getAttribute("width")).toBe("100");
			expect(cutout.getAttribute("height")).toBe("50");
			expect(mask.contains(cutout)).toBe(true);
		});

		it("supports multiple cutouts on same mask", () => {
			const mask = createSvgMask(defs);

			addCutout(mask, new DOMRect(10, 10, 50, 50), new DOMRect(0, 0, 800, 600));
			addCutout(mask, new DOMRect(60, 10, 50, 50), new DOMRect(0, 0, 800, 600));

			const rects = mask.querySelectorAll("rect");

			expect(rects.length).toBe(3); // white base + 2 cutouts
		});
	});

	describe("removeCutouts", () => {
		it("removes specific cutout rects from their masks", () => {
			const mask = createSvgMask(defs);

			const cutout1 = addCutout(mask, new DOMRect(10, 10, 50, 50), new DOMRect(0, 0, 800, 600));
			const cutout2 = addCutout(mask, new DOMRect(60, 10, 50, 50), new DOMRect(0, 0, 800, 600));

			removeCutouts([cutout1]);

			expect(mask.contains(cutout1)).toBe(false);
			expect(mask.contains(cutout2)).toBe(true);

			// white base rect still present
			expect(mask.querySelectorAll("rect").length).toBe(2);
		});

		it("leaves mask intact when all cutouts removed", () => {
			const mask = createSvgMask(defs);

			const cutout = addCutout(mask, new DOMRect(10, 10, 50, 50), new DOMRect(0, 0, 800, 600));

			removeCutouts([cutout]);

			// Mask still exists with white base rect — visual no-op
			expect(mask.querySelectorAll("rect").length).toBe(1);
			expect(mask.querySelector("rect")?.getAttribute("fill")).toBe("white");
		});
	});
});
