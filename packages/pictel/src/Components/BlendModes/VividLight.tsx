import type { ReactNode } from "react";
import { RasterBlend } from "../Pipeline/RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";
import { vividLightChannel } from "./utils/vivid-light-channel";

export const vividLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [vividLightChannel(dr, sr), vividLightChannel(dg, sg), vividLightChannel(db, sb)];

interface VividLightProps {
	opacity?: number;
	flatten?: boolean;
	children: ReactNode;
}

/**
 * Combines Color Burn and Color Dodge based on the blend brightness.
 * Dark blend values increase contrast via burn; light values decrease via dodge.
 *
 * @param props
 * @category Blend Modes
 */
export function VividLight({ opacity, flatten, children }: VividLightProps) {
	return (
		<RasterBlend blend={vividLight} opacity={opacity} flatten={flatten}>
			{children}
		</RasterBlend>
	);
}
