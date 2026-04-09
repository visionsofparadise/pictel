import type { ComponentProps } from "react";
import { RasterBlend } from "../Pipeline/RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";

function linearLightChannel(dst: number, src: number): number {
	return src <= 0.5 ? Math.max(0, dst + 2 * src - 1) : Math.min(1, dst + 2 * src - 1);
}

export const linearLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [linearLightChannel(dr, sr), linearLightChannel(dg, sg), linearLightChannel(db, sb)];

interface LinearLightProps extends ComponentProps<"div"> {
	opacity?: number;
	flatten?: boolean;
}

/**
 * Combines Linear Burn and Linear Dodge based on the blend brightness.
 * Burns darks and dodges lights with linear intensity scaling.
 *
 * @param props
 * @category Blend Modes
 */
export function LinearLight({ opacity, flatten, ...rest }: LinearLightProps) {
	return (
		<RasterBlend blend={linearLight} opacity={opacity} flatten={flatten} {...rest} />
	);
}
