import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useCallback } from "react";
import { CompositeEffect } from "../CompositeEffect";
import type { BlendFormula } from "./utils/blend-pixels";
import { blendPixels } from "./utils/blend-pixels";

function linearLightChannel(dst: number, src: number): number {
	return src <= 0.5 ? Math.max(0, dst + 2 * src - 1) : Math.min(1, dst + 2 * src - 1);
}

export const linearLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [linearLightChannel(dr, sr), linearLightChannel(dg, sg), linearLightChannel(db, sb)];

interface LinearLightProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function LinearLight({ opacity = 1, flatten, children, style, ...rest }: LinearLightProps) {
	const effect = useCallback((self: ImageData, behind: ImageData) => blendPixels(self, behind, linearLight), []);

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
