// @vitest-environment jsdom

import { describe, it, expect, vi } from "vitest";

vi.mock("stacking-order", () => ({
	compare: (first: { _order: number }, second: { _order: number }) => {
		if (first._order < second._order) return -1;
		if (first._order > second._order) return 1;

		return 0;
	},
}));

import { buildStackingOrder, getElementsBehind, getElementsInFront, rectsIntersect } from "./stacking";

function makeRect(left: number, top: number, right: number, bottom: number): DOMRect {
	return {
		left,
		top,
		right,
		bottom,
		width: right - left,
		height: bottom - top,
		x: left,
		y: top,
		toJSON() {
			return {};
		},
	};
}

function createElement(order: number, parent?: HTMLElement): HTMLElement {
	const element = document.createElement("div");
	Object.defineProperty(element, "_order", { value: order, writable: true });

	if (parent) {
		parent.appendChild(element);
	}

	return element;
}

describe("rectsIntersect", () => {
	it("returns true for overlapping rects", () => {
		const first = makeRect(0, 0, 100, 100);
		const second = makeRect(50, 50, 150, 150);

		expect(rectsIntersect(first, second)).toBe(true);
	});

	it("returns false for non-overlapping rects horizontally", () => {
		const first = makeRect(0, 0, 50, 100);
		const second = makeRect(60, 0, 110, 100);

		expect(rectsIntersect(first, second)).toBe(false);
	});

	it("returns false for non-overlapping rects vertically", () => {
		const first = makeRect(0, 0, 100, 50);
		const second = makeRect(0, 60, 100, 110);

		expect(rectsIntersect(first, second)).toBe(false);
	});

	it("returns false for edge-touching rects (shared edge, no overlap)", () => {
		const first = makeRect(0, 0, 100, 100);
		const second = makeRect(100, 0, 200, 100);

		expect(rectsIntersect(first, second)).toBe(false);
	});

	it("returns true for fully contained rect", () => {
		const outer = makeRect(0, 0, 200, 200);
		const inner = makeRect(50, 50, 100, 100);

		expect(rectsIntersect(outer, inner)).toBe(true);
	});

	it("returns true for identical rects", () => {
		const rect = makeRect(10, 10, 90, 90);

		expect(rectsIntersect(rect, rect)).toBe(true);
	});
});

describe("buildStackingOrder", () => {
	it("returns single element for array with one element", () => {
		const root = createElement(0);
		const result = buildStackingOrder([root]);

		expect(result.order).toHaveLength(1);
		expect(result.order[0]).toBe(root);
		expect(result.indexOf.get(root)).toBe(0);
	});

	it("sorts elements by comparator order", () => {
		const root = createElement(0);
		const childC = createElement(3);
		const childA = createElement(1);
		const childB = createElement(2);

		// Pass in unsorted order — sort should reorder them
		const result = buildStackingOrder([root, childC, childA, childB]);

		expect(result.order).toHaveLength(4);
		expect(result.order[0]).toBe(root);
		expect(result.order[1]).toBe(childA);
		expect(result.order[2]).toBe(childB);
		expect(result.order[3]).toBe(childC);
	});

	it("builds indexOf map matching array positions", () => {
		const root = createElement(0);
		const childA = createElement(1);
		const childB = createElement(2);

		const result = buildStackingOrder([root, childA, childB]);

		expect(result.indexOf.get(root)).toBe(0);
		expect(result.indexOf.get(childA)).toBe(1);
		expect(result.indexOf.get(childB)).toBe(2);
		expect(result.indexOf.size).toBe(3);
	});

	it("handles elements from nested DOM structure", () => {
		const root = createElement(0);
		const parent = createElement(1, root);
		const child = createElement(2, parent);

		const result = buildStackingOrder([root, parent, child]);

		expect(result.order).toHaveLength(3);
		expect(result.indexOf.has(child)).toBe(true);
	});
});

describe("getElementsBehind", () => {
	it("returns elements before the target that intersect its rect", () => {
		const elementA = createElement(0);
		const elementB = createElement(1);
		const target = createElement(2);

		const stackingOrder = {
			order: [elementA, elementB, target] as ReadonlyArray<HTMLElement>,
			indexOf: new Map<HTMLElement, number>([
				[elementA, 0],
				[elementB, 1],
				[target, 2],
			]),
		};

		const rects = new Map<HTMLElement, DOMRect>([
			[elementA, makeRect(0, 0, 100, 100)],
			[elementB, makeRect(50, 50, 150, 150)],
			[target, makeRect(80, 80, 180, 180)],
		]);

		const behind = getElementsBehind(target, stackingOrder, rects);

		expect(behind).toContain(elementA);
		expect(behind).toContain(elementB);
		expect(behind).toHaveLength(2);
	});

	it("filters out elements that do not intersect the target rect", () => {
		const farAway = createElement(0);
		const overlapping = createElement(1);
		const target = createElement(2);

		const stackingOrder = {
			order: [farAway, overlapping, target] as ReadonlyArray<HTMLElement>,
			indexOf: new Map<HTMLElement, number>([
				[farAway, 0],
				[overlapping, 1],
				[target, 2],
			]),
		};

		const rects = new Map<HTMLElement, DOMRect>([
			[farAway, makeRect(500, 500, 600, 600)],
			[overlapping, makeRect(10, 10, 60, 60)],
			[target, makeRect(0, 0, 50, 50)],
		]);

		const behind = getElementsBehind(target, stackingOrder, rects);

		expect(behind).toContain(overlapping);
		expect(behind).not.toContain(farAway);
		expect(behind).toHaveLength(1);
	});

	it("returns empty array for element not in stacking order", () => {
		const target = createElement(0);
		const stackingOrder = { order: [] as ReadonlyArray<HTMLElement>, indexOf: new Map<HTMLElement, number>() };
		const rects = new Map<HTMLElement, DOMRect>();

		expect(getElementsBehind(target, stackingOrder, rects)).toEqual([]);
	});

	it("returns empty array when target has no rect in rects map", () => {
		const target = createElement(1);
		const other = createElement(0);

		const stackingOrder = {
			order: [other, target] as ReadonlyArray<HTMLElement>,
			indexOf: new Map<HTMLElement, number>([
				[other, 0],
				[target, 1],
			]),
		};

		const rects = new Map<HTMLElement, DOMRect>([
			[other, makeRect(0, 0, 100, 100)],
			// target has no rect
		]);

		expect(getElementsBehind(target, stackingOrder, rects)).toEqual([]);
	});

	it("returns empty array when target is first in stacking order", () => {
		const target = createElement(0);

		const stackingOrder = {
			order: [target] as ReadonlyArray<HTMLElement>,
			indexOf: new Map<HTMLElement, number>([[target, 0]]),
		};

		const rects = new Map<HTMLElement, DOMRect>([
			[target, makeRect(0, 0, 100, 100)],
		]);

		expect(getElementsBehind(target, stackingOrder, rects)).toEqual([]);
	});
});

describe("getElementsInFront", () => {
	it("returns elements after the target that intersect its rect", () => {
		const target = createElement(0);
		const elementA = createElement(1);
		const elementB = createElement(2);

		const stackingOrder = {
			order: [target, elementA, elementB] as ReadonlyArray<HTMLElement>,
			indexOf: new Map<HTMLElement, number>([
				[target, 0],
				[elementA, 1],
				[elementB, 2],
			]),
		};

		const rects = new Map<HTMLElement, DOMRect>([
			[target, makeRect(0, 0, 100, 100)],
			[elementA, makeRect(50, 50, 150, 150)],
			[elementB, makeRect(80, 80, 180, 180)],
		]);

		const inFront = getElementsInFront(target, stackingOrder, rects);

		expect(inFront).toContain(elementA);
		expect(inFront).toContain(elementB);
		expect(inFront).toHaveLength(2);
	});

	it("filters out elements that do not intersect the target rect", () => {
		const target = createElement(0);
		const overlapping = createElement(1);
		const farAway = createElement(2);

		const stackingOrder = {
			order: [target, overlapping, farAway] as ReadonlyArray<HTMLElement>,
			indexOf: new Map<HTMLElement, number>([
				[target, 0],
				[overlapping, 1],
				[farAway, 2],
			]),
		};

		const rects = new Map<HTMLElement, DOMRect>([
			[target, makeRect(0, 0, 50, 50)],
			[overlapping, makeRect(10, 10, 60, 60)],
			[farAway, makeRect(500, 500, 600, 600)],
		]);

		const inFront = getElementsInFront(target, stackingOrder, rects);

		expect(inFront).toContain(overlapping);
		expect(inFront).not.toContain(farAway);
		expect(inFront).toHaveLength(1);
	});

	it("returns empty array for element not in stacking order", () => {
		const target = createElement(0);
		const stackingOrder = { order: [] as ReadonlyArray<HTMLElement>, indexOf: new Map<HTMLElement, number>() };
		const rects = new Map<HTMLElement, DOMRect>();

		expect(getElementsInFront(target, stackingOrder, rects)).toEqual([]);
	});

	it("returns empty array when target has no rect in rects map", () => {
		const target = createElement(0);
		const other = createElement(1);

		const stackingOrder = {
			order: [target, other] as ReadonlyArray<HTMLElement>,
			indexOf: new Map<HTMLElement, number>([
				[target, 0],
				[other, 1],
			]),
		};

		const rects = new Map<HTMLElement, DOMRect>([
			[other, makeRect(0, 0, 100, 100)],
			// target has no rect
		]);

		expect(getElementsInFront(target, stackingOrder, rects)).toEqual([]);
	});

	it("returns empty array when target is last in stacking order", () => {
		const target = createElement(0);

		const stackingOrder = {
			order: [target] as ReadonlyArray<HTMLElement>,
			indexOf: new Map<HTMLElement, number>([[target, 0]]),
		};

		const rects = new Map<HTMLElement, DOMRect>([
			[target, makeRect(0, 0, 100, 100)],
		]);

		expect(getElementsInFront(target, stackingOrder, rects)).toEqual([]);
	});
});
