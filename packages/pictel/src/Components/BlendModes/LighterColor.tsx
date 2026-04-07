import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useCallback } from "react";
import { CompositeEffect } from "../CompositeEffect";
import type { BlendFormula } from "./utils/blend-pixels";
import { blendPixels } from "./utils/blend-pixels";
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

export function LighterColor({ opacity = 1, flatten, children, style, ...rest }: LighterColorProps) {
	const effect = useCallback((self: ImageData, behind: ImageData) => blendPixels(self, behind, lighterColor), []);

	return (
		<CompositeEffect
			effect={effect}
			flatten={flatten}
			{...rest}
			style={{ ...style, opacity }}
		>
			{children}
		</CompositeEffect>
	);
}
