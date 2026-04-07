import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { RasterBlend } from "../RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";
import { vividLightChannel } from "./utils/vivid-light-channel";

export const hardMix: BlendFormula = (sr, sg, sb, dr, dg, db) => [vividLightChannel(dr, sr) >= 0.5 ? 1 : 0, vividLightChannel(dg, sg) >= 0.5 ? 1 : 0, vividLightChannel(db, sb) >= 0.5 ? 1 : 0];

interface HardMixProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function HardMix({ opacity, flatten, children, ...rest }: HardMixProps) {
	return (
		<RasterBlend blend={hardMix} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	);
}
