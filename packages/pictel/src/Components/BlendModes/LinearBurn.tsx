import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { RasterBlend } from "../RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";

export const linearBurn: BlendFormula = (sr, sg, sb, dr, dg, db) => [Math.max(0, sr + dr - 1), Math.max(0, sg + dg - 1), Math.max(0, sb + db - 1)];

interface LinearBurnProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function LinearBurn({ opacity, flatten, children, ...rest }: LinearBurnProps) {
	return (
		<RasterBlend blend={linearBurn} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	);
}
