import type { StackingOrder } from "../../../utils/stacking";

export function checkStackingEscape(target: HTMLElement, stackingOrder: StackingOrder): HTMLElement | null {
	const parentIndex = stackingOrder.indexOf.get(target);

	if (parentIndex === undefined) return null;

	const descendants = target.querySelectorAll("*");

	for (const descendant of descendants) {
		const childIndex = stackingOrder.indexOf.get(descendant as HTMLElement);

		if (childIndex !== undefined && childIndex < parentIndex) {
			return descendant as HTMLElement;
		}
	}

	return null;
}
