import type { ReactNode } from "react";
import { RasterBlend } from "../Pipeline/RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";

export const subtract: BlendFormula = (sr, sg, sb, dr, dg, db) => [Math.max(0, dr - sr), Math.max(0, dg - sg), Math.max(0, db - sb)];

interface SubtractProps {
	opacity?: number;
	children: ReactNode;
}

/**
 * Subtracts the blend color from the base color per channel, clamped to black.
 * Produces dark results; useful for masking or creating silhouettes.
 *
 * @param props
 * @category Blend Modes
 */
export function Subtract({ opacity, children }: SubtractProps) {
	return (
		<RasterBlend blend={subtract} opacity={opacity}>
			{children}
		</RasterBlend>
	);
}
