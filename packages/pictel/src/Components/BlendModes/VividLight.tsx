import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { RasterBlend } from "../RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";
import { vividLightChannel } from "./utils/vivid-light-channel";

export const vividLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [vividLightChannel(dr, sr), vividLightChannel(dg, sg), vividLightChannel(db, sb)];

interface VividLightProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function VividLight({ opacity, flatten, children, ...rest }: VividLightProps) {
	return (
		<RasterBlend blend={vividLight} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	);
}
