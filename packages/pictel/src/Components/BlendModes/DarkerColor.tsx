import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { RasterBlend } from "../RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";
import { luminance } from "./utils/luminance";

export const darkerColor: BlendFormula = (sr, sg, sb, dr, dg, db) => {
	const sl = luminance(sr, sg, sb);
	const dl = luminance(dr, dg, db);

	return sl < dl ? [sr, sg, sb] : [dr, dg, db];
};

interface DarkerColorProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function DarkerColor({ opacity, flatten, children, ...rest }: DarkerColorProps) {
	return (
		<RasterBlend blend={darkerColor} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	);
}
