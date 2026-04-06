import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useCallback } from "react";
import { CompositeEffect } from "../CompositeEffect";
import type { BlendFormula } from "./blend-pixels";
import { blendPixels } from "./blend-pixels";

function pinLightChannel(dst: number, src: number): number {
	return src <= 0.5 ? Math.min(dst, 2 * src) : Math.max(dst, 2 * src - 1)
}

export const pinLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [
	pinLightChannel(dr, sr),
	pinLightChannel(dg, sg),
	pinLightChannel(db, sb),
]

interface PinLightProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function PinLight({ opacity = 1, flatten, children, style, ...rest }: PinLightProps) {
	const effect = useCallback(
		(self: ImageData, behind: ImageData) => blendPixels(self, behind, pinLight),
		[],
	);

	return (
		<CompositeEffect effect={effect} flatten={flatten} {...rest} style={{ ...style, opacity }}>
			{children}
		</CompositeEffect>
	);
}
