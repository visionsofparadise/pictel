import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useCallback } from "react";
import { CompositeEffect } from "../CompositeEffect";
import type { BlendFormula } from "./utils/blend-pixels";
import { blendPixels } from "./utils/blend-pixels";

export const linearDodge: BlendFormula = (sr, sg, sb, dr, dg, db) => [Math.min(1, sr + dr), Math.min(1, sg + dg), Math.min(1, sb + db)];

interface LinearDodgeProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function LinearDodge({ opacity = 1, flatten, children, style, ...rest }: LinearDodgeProps) {
	const effect = useCallback((self: ImageData, behind: ImageData) => blendPixels(self, behind, linearDodge), []);

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
