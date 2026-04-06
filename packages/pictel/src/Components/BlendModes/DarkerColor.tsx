import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useCallback } from "react";
import { CompositeEffect } from "../CompositeEffect";
import type { BlendFormula } from "./blend-pixels";
import { blendPixels } from "./blend-pixels";
import { luminance } from "./utils/luminance";

export const darkerColor: BlendFormula = (sr, sg, sb, dr, dg, db) => {
	const sl = luminance(sr, sg, sb)
	const dl = luminance(dr, dg, db)

	return sl < dl ? [sr, sg, sb] : [dr, dg, db]
}

interface DarkerColorProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function DarkerColor({ opacity = 1, flatten, children, style, ...rest }: DarkerColorProps) {
	const effect = useCallback(
		(self: ImageData, behind: ImageData) => blendPixels(self, behind, darkerColor),
		[],
	);

	return (
		<CompositeEffect effect={effect} flatten={flatten} {...rest} style={{ ...style, opacity }}>
			{children}
		</CompositeEffect>
	);
}
