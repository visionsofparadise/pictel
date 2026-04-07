import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { RasterBlend } from "../RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";

function linearLightChannel(dst: number, src: number): number {
	return src <= 0.5 ? Math.max(0, dst + 2 * src - 1) : Math.min(1, dst + 2 * src - 1);
}

export const linearLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [linearLightChannel(dr, sr), linearLightChannel(dg, sg), linearLightChannel(db, sb)];

interface LinearLightProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function LinearLight({ opacity, flatten, children, ...rest }: LinearLightProps) {
	return (
		<RasterBlend blend={linearLight} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	);
}
