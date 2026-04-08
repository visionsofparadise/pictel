import type { ComponentProps } from "react";
import { RasterBlend } from "../RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";
import { vividLightChannel } from "./utils/vivid-light-channel";

export const vividLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [vividLightChannel(dr, sr), vividLightChannel(dg, sg), vividLightChannel(db, sb)];

interface VividLightProps extends ComponentProps<"div"> {
	opacity?: number;
	flatten?: boolean;
}

/**
 * Combines Color Burn and Color Dodge based on the blend brightness.
 * Dark blend values increase contrast via burn; light values decrease via dodge.
 *
 * @param props
 * @category Blend Modes
 */
export function VividLight({ opacity, flatten, ...rest }: VividLightProps) {
	return (
		<RasterBlend blend={vividLight} opacity={opacity} flatten={flatten} {...rest} />
	);
}
