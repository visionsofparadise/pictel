import { Children, isValidElement, type ReactNode } from "react";
import { Map } from "../Map";

interface SeparatedChildren {
	content: Array<ReactNode>;
	maps: Array<ReactNode>;
}

/**
 * Separates direct children into content and map elements
 * by checking if the child's type is the Map component.
 */
export function separateChildren(children: ReactNode): SeparatedChildren {
	const content: Array<ReactNode> = [];
	const maps: Array<ReactNode> = [];

	Children.forEach(children, (child) => {
		if (isValidElement(child) && child.type === Map) {
			maps.push(child);
		} else {
			content.push(child);
		}
	});

	return { content, maps };
}
