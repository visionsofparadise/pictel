import { describe, it, expect, vi } from "vitest";
import { buildExecutionOrder, type Registration } from "./graph";
import type { StackingOrder } from "./stacking";

function createMockElement(parent?: ReturnType<typeof createMockElement>) {
	const element = {
		contains(other: unknown): boolean {
			let current = other as { _parent?: typeof element };
			while (current._parent) {
				if (current._parent === element) return true;
				current = current._parent as { _parent?: typeof element };
			}
			return false;
		},
		getBoundingClientRect(): DOMRect {
			return element._rect;
		},
		_parent: parent,
		_order: 0,
		_rect: { left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 } as DOMRect,
	};

	return element;
}

function createRegistration(
	id: string,
	type: "raster" | "composite",
	element: ReturnType<typeof createMockElement>,
): Registration {
	return {
		id,
		ref: { current: element as unknown as HTMLElement },
		type,
		effect: vi.fn(),
	};
}

function createMockStackingOrder(elements: Array<{ element: ReturnType<typeof createMockElement>; index: number }>): StackingOrder {
	const indexOf = new Map<HTMLElement, number>();
	const order: Array<HTMLElement> = [];

	// Sort by index to build order array
	const sorted = [...elements].sort((first, second) => first.index - second.index);

	for (const entry of sorted) {
		indexOf.set(entry.element as unknown as HTMLElement, entry.index);
		order.push(entry.element as unknown as HTMLElement);
	}

	return { order, indexOf };
}

function buildRectsMap(elements: Array<ReturnType<typeof createMockElement>>): Map<HTMLElement, DOMRect> {
	const rects = new Map<HTMLElement, DOMRect>();

	for (const element of elements) {
		rects.set(element as unknown as HTMLElement, element._rect);
	}

	return rects;
}

describe("buildExecutionOrder", () => {
	it("returns empty array for no registrations", () => {
		const stackingOrder = createMockStackingOrder([]);
		const rects = new Map<HTMLElement, DOMRect>();
		const result = buildExecutionOrder([], stackingOrder, rects);
		expect(result).toEqual([]);
	});

	it("places a single raster effect in one level", () => {
		const element = createMockElement();
		element._order = 0;

		const reg = createRegistration("r1", "raster", element);
		const stackingOrder = createMockStackingOrder([{ element, index: 0 }]);
		const rects = buildRectsMap([element]);
		const levels = buildExecutionOrder([reg], stackingOrder, rects);

		expect(levels).toHaveLength(1);
		expect(levels[0]).toHaveLength(1);
		expect(levels[0]![0]!.registration.id).toBe("r1");
		expect(levels[0]![0]!.dependsOn).toEqual([]);
	});

	it("places two independent raster effects in one level", () => {
		const element1 = createMockElement();
		element1._order = 0;
		const element2 = createMockElement();
		element2._order = 1;

		const reg1 = createRegistration("r1", "raster", element1);
		const reg2 = createRegistration("r2", "raster", element2);
		const stackingOrder = createMockStackingOrder([
			{ element: element1, index: 0 },
			{ element: element2, index: 1 },
		]);
		const rects = buildRectsMap([element1, element2]);
		const levels = buildExecutionOrder([reg1, reg2], stackingOrder, rects);

		expect(levels).toHaveLength(1);
		expect(levels[0]).toHaveLength(2);
	});

	it("places nested effects in separate levels with inner first", () => {
		const outer = createMockElement();
		outer._order = 0;
		const inner = createMockElement(outer);
		inner._order = 1;

		const outerReg = createRegistration("outer", "raster", outer);
		const innerReg = createRegistration("inner", "raster", inner);
		const stackingOrder = createMockStackingOrder([
			{ element: outer, index: 0 },
			{ element: inner, index: 1 },
		]);
		const rects = buildRectsMap([outer, inner]);
		const levels = buildExecutionOrder([outerReg, innerReg], stackingOrder, rects);

		expect(levels).toHaveLength(2);
		expect(levels[0]![0]!.registration.id).toBe("inner");
		expect(levels[1]![0]!.registration.id).toBe("outer");
		expect(levels[1]![0]!.dependsOn).toContain("inner");
	});

	it("composite effect depends on overlapping earlier raster", () => {
		const rasterElement = createMockElement();
		rasterElement._order = 0;
		rasterElement._rect = {
			left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100,
		} as DOMRect;

		const compositeElement = createMockElement();
		compositeElement._order = 1;
		compositeElement._rect = {
			left: 50, top: 50, right: 150, bottom: 150, width: 100, height: 100,
		} as DOMRect;

		const rasterReg = createRegistration("r1", "raster", rasterElement);
		const compositeReg = createRegistration("c1", "composite", compositeElement);
		const stackingOrder = createMockStackingOrder([
			{ element: rasterElement, index: 0 },
			{ element: compositeElement, index: 1 },
		]);
		const rects = buildRectsMap([rasterElement, compositeElement]);
		const levels = buildExecutionOrder([rasterReg, compositeReg], stackingOrder, rects);

		expect(levels).toHaveLength(2);
		expect(levels[0]![0]!.registration.id).toBe("r1");
		expect(levels[1]![0]!.registration.id).toBe("c1");
		expect(levels[1]![0]!.dependsOn).toContain("r1");
	});
});
