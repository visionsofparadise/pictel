import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { RasterBlend } from "../RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";

export const linearDodge: BlendFormula = (sr, sg, sb, dr, dg, db) => [Math.min(1, sr + dr), Math.min(1, sg + dg), Math.min(1, sb + db)];

interface LinearDodgeProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function LinearDodge({ opacity, flatten, children, ...rest }: LinearDodgeProps) {
	return (
		<RasterBlend blend={linearDodge} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	);
}
