// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { applyCutout, createMaskState, setupMasks, teardownMasks, type MaskState } from "./masking";

describe("masking", () => {
	let canvasRoot: HTMLDivElement;
	let state: MaskState;

	beforeEach(() => {
		canvasRoot = document.createElement("div");
		document.body.appendChild(canvasRoot);
		state = createMaskState();
	});

	function addChild(): HTMLDivElement {
		const child = document.createElement("div");

		canvasRoot.appendChild(child);

		return child;
	}

	describe("createMaskState", () => {
		it("returns empty initial state", () => {
			expect(state.tracked.size).toBe(0);
			expect(state.svgContainer).toBeNull();
			expect(state.canvasRect).toBeNull();
		});
	});

	describe("setupMasks", () => {
		it("creates SVG container on first call", () => {
			addChild();
			setupMasks(canvasRoot, state);

			expect(state.svgContainer).not.toBeNull();
			expect(canvasRoot.querySelector("svg")).not.toBeNull();
			expect(canvasRoot.querySelector("svg defs")).not.toBeNull();
		});

		it("tracks new elements", () => {
			const child1 = addChild();
			const child2 = addChild();

			setupMasks(canvasRoot, state);

			expect(state.tracked.size).toBe(2);
			expect(state.tracked.has(child1)).toBe(true);
			expect(state.tracked.has(child2)).toBe(true);
		});

		it("applies mask style to tracked elements", () => {
			const child = addChild();

			setupMasks(canvasRoot, state);

			expect(child.style.maskImage).toContain("pictel-mask-");
		});

		it("updates canvasRect", () => {
			setupMasks(canvasRoot, state);
			expect(state.canvasRect).not.toBeNull();
		});

		it("returns a rects map with entries for each tracked element", () => {
			const child1 = addChild();
			const child2 = addChild();

			const { rects } = setupMasks(canvasRoot, state);

			expect(rects.has(child1)).toBe(true);
			expect(rects.has(child2)).toBe(true);
			expect(rects.has(canvasRoot)).toBe(true);
		});

		it("generates mask IDs with pictel-mask- prefix", () => {
			addChild();
			setupMasks(canvasRoot, state);

			const defs = canvasRoot.querySelector("svg defs");
			const mask = defs?.querySelector("mask");

			expect(mask).not.toBeNull();
			expect(mask?.getAttribute("id")).toMatch(/^pictel-mask-.+/);
		});

		it("does not track SVG container or its children", () => {
			addChild();
			setupMasks(canvasRoot, state);

			const svgContainer = state.svgContainer;

			expect(svgContainer).not.toBeNull();
			expect(state.tracked.has(svgContainer as unknown as HTMLElement)).toBe(false);
		});
	});

	describe("teardownMasks", () => {
		it("strips mask styles from all tracked elements", () => {
			const child = addChild();

			setupMasks(canvasRoot, state);
			expect(child.style.maskImage).toContain("pictel-mask-");

			teardownMasks(state);

			expect(child.style.maskImage).toBe("");
		});

		it("removes SVG container from DOM", () => {
			addChild();
			setupMasks(canvasRoot, state);

			expect(canvasRoot.querySelector("svg")).not.toBeNull();

			teardownMasks(state);

			expect(canvasRoot.querySelector("svg")).toBeNull();
		});

		it("clears tracked map", () => {
			addChild();
			setupMasks(canvasRoot, state);

			expect(state.tracked.size).toBeGreaterThan(0);

			teardownMasks(state);

			expect(state.tracked.size).toBe(0);
		});

		it("resets svgContainer and canvasRect to null", () => {
			addChild();
			setupMasks(canvasRoot, state);

			expect(state.svgContainer).not.toBeNull();
			expect(state.canvasRect).not.toBeNull();

			teardownMasks(state);

			expect(state.svgContainer).toBeNull();
			expect(state.canvasRect).toBeNull();
		});

		it("preserves user mask layers when stripping", () => {
			const child = addChild();

			child.style.maskImage = "url(#user-mask)";
			child.style.maskComposite = "subtract";

			setupMasks(canvasRoot, state);

			teardownMasks(state);

			expect(child.style.maskImage).toContain("user-mask");
			expect(child.style.maskImage).not.toContain("pictel-mask-");
			expect(child.style.maskComposite).toBe("subtract");
		});
	});

	describe("mask style preservation", () => {
		it("appends to existing maskImage", () => {
			const child = addChild();

			child.style.maskImage = "url(#user-mask)";

			setupMasks(canvasRoot, state);

			expect(child.style.maskImage).toContain("user-mask");
			expect(child.style.maskImage).toContain("pictel-mask-");
		});

		it("appends intersect to maskComposite when existing maskImage", () => {
			const child = addChild();

			child.style.maskImage = "url(#user-mask)";
			child.style.maskComposite = "subtract";

			setupMasks(canvasRoot, state);

			expect(child.style.maskComposite).toContain("subtract");
			expect(child.style.maskComposite).toContain("intersect");
		});
	});

	describe("applyCutout", () => {
		it("adds black rect to element SVG mask", () => {
			const child = addChild();

			setupMasks(canvasRoot, state);

			const sourceRect = new DOMRect(10, 20, 100, 50);

			applyCutout(child, sourceRect, state);

			const entry = state.tracked.get(child)!;

			expect(entry.svgMask.children.length).toBe(2); // white base + cutout

			const cutout = entry.svgMask.children[1]!;

			expect(cutout.getAttribute("fill")).toBe("black");
			expect(cutout.getAttribute("width")).toBe("100");
			expect(cutout.getAttribute("height")).toBe("50");
		});

		it("does nothing for untracked elements", () => {
			const untracked = document.createElement("div");
			const sourceRect = new DOMRect(0, 0, 100, 100);

			// Should not throw
			applyCutout(untracked, sourceRect, state);
		});

		it("supports multiple cutouts on same element", () => {
			const child = addChild();

			setupMasks(canvasRoot, state);

			applyCutout(child, new DOMRect(0, 0, 50, 50), state);
			applyCutout(child, new DOMRect(60, 0, 50, 50), state);

			const entry = state.tracked.get(child)!;

			expect(entry.svgMask.children.length).toBe(3); // white base + 2 cutouts
		});
	});
});
