import type { ComponentProps } from "react";
import { RasterBlend } from "../RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";

export const linearBurn: BlendFormula = (sr, sg, sb, dr, dg, db) => [Math.max(0, sr + dr - 1), Math.max(0, sg + dg - 1), Math.max(0, sb + db - 1)];

interface LinearBurnProps extends ComponentProps<"div"> {
	opacity?: number;
	flatten?: boolean;
}

/**
 * Adds the base and blend values then subtracts 1 per channel. Produces darker results
 * than Multiply with a linear falloff.
 *
 * @param props
 * @category Blend Modes
 */
export function LinearBurn({ opacity, flatten, ...rest }: LinearBurnProps) {
	return (
		<RasterBlend blend={linearBurn} opacity={opacity} flatten={flatten} {...rest} />
	);
}
