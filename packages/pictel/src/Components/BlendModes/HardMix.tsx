import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useCallback } from "react";
import { CompositeEffect } from "../CompositeEffect";
import type { BlendFormula } from "./blend-pixels";
import { blendPixels } from "./blend-pixels";
import { vividLightChannel } from "./utils/vivid-light-channel";

export const hardMix: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	vividLightChannel(dr, sr) >= 0.5 ? 1 : 0,
	vividLightChannel(dg, sg) >= 0.5 ? 1 : 0,
	vividLightChannel(db, sb) >= 0.5 ? 1 : 0,
]

interface HardMixProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function HardMix({ opacity = 1, flatten, children, style, ...rest }: HardMixProps) {
	const effect = useCallback(
		(self: ImageData, behind: ImageData) => blendPixels(self, behind, hardMix),
		[],
	);

	return (
		<CompositeEffect effect={effect} flatten={flatten} {...rest} style={{ ...style, opacity }}>
			{children}
		</CompositeEffect>
	);
}
