import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useCallback } from "react";
import { CompositeEffect } from "../CompositeEffect";
import type { BlendFormula } from "./utils/blend-pixels";
import { blendPixels } from "./utils/blend-pixels";

export const linearBurn: BlendFormula = (sr, sg, sb, dr, dg, db) => [Math.max(0, sr + dr - 1), Math.max(0, sg + dg - 1), Math.max(0, sb + db - 1)];

interface LinearBurnProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function LinearBurn({ opacity = 1, flatten, children, style, ...rest }: LinearBurnProps) {
	const effect = useCallback((self: ImageData, behind: ImageData) => blendPixels(self, behind, linearBurn), []);

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
