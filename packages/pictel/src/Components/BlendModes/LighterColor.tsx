import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { RasterBlend } from "../RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";
import { luminance } from "./utils/luminance";

export const lighterColor: BlendFormula = (sr, sg, sb, dr, dg, db) => {
	const sl = luminance(sr, sg, sb);
	const dl = luminance(dr, dg, db);

	return sl > dl ? [sr, sg, sb] : [dr, dg, db];
};

interface LighterColorProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function LighterColor({ opacity, flatten, children, ...rest }: LighterColorProps) {
	return (
		<RasterBlend blend={lighterColor} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	);
}
