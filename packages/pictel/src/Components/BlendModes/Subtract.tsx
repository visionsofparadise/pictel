import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { RasterBlend } from "../RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";

export const subtract: BlendFormula = (sr, sg, sb, dr, dg, db) => [Math.max(0, dr - sr), Math.max(0, dg - sg), Math.max(0, db - sb)];

interface SubtractProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function Subtract({ opacity, flatten, children, ...rest }: SubtractProps) {
	return (
		<RasterBlend blend={subtract} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	);
}
