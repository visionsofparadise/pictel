import type { ComponentProps } from "react";
import { RasterBlend } from "../Pipeline/RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";

export const linearDodge: BlendFormula = (sr, sg, sb, dr, dg, db) => [Math.min(1, sr + dr), Math.min(1, sg + dg), Math.min(1, sb + db)];

interface LinearDodgeProps extends ComponentProps<"div"> {
	opacity?: number;
	flatten?: boolean;
}

/**
 * Adds the base and blend values per channel, clamped to white.
 * Also known as Add. Produces lighter results than Screen with a linear curve.
 *
 * @param props
 * @category Blend Modes
 */
export function LinearDodge({ opacity, flatten, ...rest }: LinearDodgeProps) {
	return (
		<RasterBlend blend={linearDodge} opacity={opacity} flatten={flatten} {...rest} />
	);
}
