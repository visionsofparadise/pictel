import { Children, isValidElement, type ReactNode } from "react";
import { Map } from "../Map";

export function hasTargetChildren(children: ReactNode): boolean {
	let hasTarget = false;

	Children.forEach(children, (child) => {
		if (hasTarget) return;

		if (isValidElement(child) && child.type !== Map) {
			hasTarget = true;
		}
	});

	return hasTarget;
}
