import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useCallback } from "react";
import { CompositeEffect } from "../CompositeEffect";
import type { BlendFormula } from "./blend-pixels";
import { blendPixels } from "./blend-pixels";

export const subtract: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	Math.max(0, dr - sr),
	Math.max(0, dg - sg),
	Math.max(0, db - sb),
]

interface SubtractProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function Subtract({ opacity = 1, flatten, children, style, ...rest }: SubtractProps) {
	const effect = useCallback(
		(self: ImageData, behind: ImageData) => blendPixels(self, behind, subtract),
		[],
	);

	return (
		<CompositeEffect effect={effect} flatten={flatten} {...rest} style={{ ...style, opacity }}>
			{children}
		</CompositeEffect>
	);
}
