import type { ReactNode } from "react";
import { RasterBlend } from "../Pipeline/RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";
import { luminance } from "./utils/luminance";

export const darkerColor: BlendFormula = (sr, sg, sb, dr, dg, db) => {
	const sl = luminance(sr, sg, sb);
	const dl = luminance(dr, dg, db);

	return sl < dl ? [sr, sg, sb] : [dr, dg, db];
};

interface DarkerColorProps {
	opacity?: number;
	flatten?: boolean;
	children: ReactNode;
}

/**
 * Compares the overall luminance of base and blend pixels and keeps the darker one.
 * Unlike Darken, operates on the whole pixel rather than per-channel.
 *
 * @param props
 * @category Blend Modes
 */
export function DarkerColor({ opacity, flatten, children }: DarkerColorProps) {
	return (
		<RasterBlend blend={darkerColor} opacity={opacity} flatten={flatten}>
			{children}
		</RasterBlend>
	);
}
