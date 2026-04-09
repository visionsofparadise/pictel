import { compare } from "stacking-order";

export interface StackingOrder {
	readonly order: ReadonlyArray<HTMLElement>;
	readonly indexOf: ReadonlyMap<HTMLElement, number>;
}

export function buildStackingOrder(elements: Array<HTMLElement>): StackingOrder {
	elements.sort(compare);

	const indexOf = new Map<HTMLElement, number>();

	for (const [index, element] of elements.entries()) {
		indexOf.set(element, index);
	}

	return { order: elements, indexOf };
}

export function rectsIntersect(first: DOMRect, second: DOMRect): boolean {
	return first.left < second.right && second.left < first.right && first.top < second.bottom && second.top < first.bottom;
}

export function getElementsBehind(element: HTMLElement, stackingOrder: StackingOrder, rects: ReadonlyMap<HTMLElement, DOMRect>): Array<HTMLElement> {
	const elementIndex = stackingOrder.indexOf.get(element);

	if (elementIndex === undefined) return [];

	const elementRect = rects.get(element);

	if (!elementRect) return [];

	return stackingOrder.order.slice(0, elementIndex).filter((entry) => {
		const entryRect = rects.get(entry);

		return entryRect ? rectsIntersect(elementRect, entryRect) : false;
	});
}

export function getElementsInFront(element: HTMLElement, stackingOrder: StackingOrder, rects: ReadonlyMap<HTMLElement, DOMRect>): Array<HTMLElement> {
	const elementIndex = stackingOrder.indexOf.get(element);

	if (elementIndex === undefined) return [];

	const elementRect = rects.get(element);

	if (!elementRect) return [];

	return stackingOrder.order.slice(elementIndex + 1).filter((entry) => {
		const entryRect = rects.get(entry);

		return entryRect ? rectsIntersect(elementRect, entryRect) : false;
	});
}
