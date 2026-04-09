import type { ComponentProps } from "react";
import { RasterBlend } from "../Pipeline/RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";
import { vividLightChannel } from "./utils/vivid-light-channel";

export const hardMix: BlendFormula = (sr, sg, sb, dr, dg, db) => [vividLightChannel(dr, sr) >= 0.5 ? 1 : 0, vividLightChannel(dg, sg) >= 0.5 ? 1 : 0, vividLightChannel(db, sb) >= 0.5 ? 1 : 0];

interface HardMixProps extends ComponentProps<"div"> {
	opacity?: number;
	flatten?: boolean;
}

/**
 * Reduces each channel to fully on or fully off based on Vivid Light thresholding.
 * Produces posterized, high-contrast results with at most 8 colors.
 *
 * @param props
 * @category Blend Modes
 */
export function HardMix({ opacity, flatten, ...rest }: HardMixProps) {
	return (
		<RasterBlend blend={hardMix} opacity={opacity} flatten={flatten} {...rest} />
	);
}
