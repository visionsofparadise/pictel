import type { ComponentProps } from "react";
import { RasterBlend } from "../Pipeline/RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";

export const divide: BlendFormula = (sr, sg, sb, dr, dg, db) => [sr === 0 ? 1 : Math.min(1, dr / sr), sg === 0 ? 1 : Math.min(1, dg / sg), sb === 0 ? 1 : Math.min(1, db / sb)];

interface DivideProps extends ComponentProps<"div"> {
	opacity?: number;
	flatten?: boolean;
}

/**
 * Divides the base color by the blend color, producing a brightening effect.
 * Dark blend values create strong brightening; useful for removing color casts.
 *
 * @param props
 * @category Blend Modes
 */
export function Divide({ opacity, flatten, ...rest }: DivideProps) {
	return (
		<RasterBlend blend={divide} opacity={opacity} flatten={flatten} {...rest} />
	);
}
