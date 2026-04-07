import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { RasterBlend } from "../RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";

export const divide: BlendFormula = (sr, sg, sb, dr, dg, db) => [sr === 0 ? 1 : Math.min(1, dr / sr), sg === 0 ? 1 : Math.min(1, dg / sg), sb === 0 ? 1 : Math.min(1, db / sb)];

interface DivideProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function Divide({ opacity, flatten, children, ...rest }: DivideProps) {
	return (
		<RasterBlend blend={divide} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	);
}
