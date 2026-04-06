import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useCallback } from "react";
import { CompositeEffect } from "../CompositeEffect";
import type { BlendFormula } from "./blend-pixels";
import { blendPixels } from "./blend-pixels";

export const divide: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	sr === 0 ? 1 : Math.min(1, dr / sr),
	sg === 0 ? 1 : Math.min(1, dg / sg),
	sb === 0 ? 1 : Math.min(1, db / sb),
]

interface DivideProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function Divide({ opacity = 1, flatten, children, style, ...rest }: DivideProps) {
	const effect = useCallback(
		(self: ImageData, behind: ImageData) => blendPixels(self, behind, divide),
		[],
	);

	return (
		<CompositeEffect effect={effect} flatten={flatten} {...rest} style={{ ...style, opacity }}>
			{children}
		</CompositeEffect>
	);
}
