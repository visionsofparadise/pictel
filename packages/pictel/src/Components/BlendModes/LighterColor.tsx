import type { ReactNode } from "react";
import { RasterBlend } from "../Pipeline/RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";
import { luminance } from "./utils/luminance";

export const lighterColor: BlendFormula = (sr, sg, sb, dr, dg, db) => {
	const sl = luminance(sr, sg, sb);
	const dl = luminance(dr, dg, db);

	return sl > dl ? [sr, sg, sb] : [dr, dg, db];
};

interface LighterColorProps {
	opacity?: number;
	children: ReactNode;
}

/**
 * Compares the overall luminance of base and blend pixels and keeps the lighter one.
 * Unlike Lighten, operates on the whole pixel rather than per-channel.
 *
 * @param props
 * @category Blend Modes
 */
export function LighterColor({ opacity, children }: LighterColorProps) {
	return (
		<RasterBlend blend={lighterColor} opacity={opacity}>
			{children}
		</RasterBlend>
	);
}
