import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useCallback } from "react";
import { CompositeEffect } from "../CompositeEffect";
import type { BlendFormula } from "./blend-pixels";
import { blendPixels } from "./blend-pixels";
import { vividLightChannel } from "./utils/vivid-light-channel";

export const vividLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	vividLightChannel(dr, sr),
	vividLightChannel(dg, sg),
	vividLightChannel(db, sb),
]

interface VividLightProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function VividLight({ opacity = 1, flatten, children, style, ...rest }: VividLightProps) {
	const effect = useCallback(
		(self: ImageData, behind: ImageData) => blendPixels(self, behind, vividLight),
		[],
	);

	return (
		<CompositeEffect effect={effect} flatten={flatten} {...rest} style={{ ...style, opacity }}>
			{children}
		</CompositeEffect>
	);
}
