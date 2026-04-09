import type { ComponentProps } from "react";
import { RasterBlend } from "../Pipeline/RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";

function pinLightChannel(dst: number, src: number): number {
	return src <= 0.5 ? Math.min(dst, 2 * src) : Math.max(dst, 2 * src - 1);
}

export const pinLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [pinLightChannel(dr, sr), pinLightChannel(dg, sg), pinLightChannel(db, sb)];

interface PinLightProps extends ComponentProps<"div"> {
	opacity?: number;
	flatten?: boolean;
}

/**
 * Replaces base values depending on the blend brightness. Dark blend values
 * darken via Darken; light blend values lighten via Lighten.
 *
 * @param props
 * @category Blend Modes
 */
export function PinLight({ opacity, flatten, ...rest }: PinLightProps) {
	return (
		<RasterBlend blend={pinLight} opacity={opacity} flatten={flatten} {...rest} />
	);
}
