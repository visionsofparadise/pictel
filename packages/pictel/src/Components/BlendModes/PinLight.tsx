import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { RasterBlend } from "../RasterBlend";
import type { BlendFormula } from "./utils/blend-pixels";

function pinLightChannel(dst: number, src: number): number {
	return src <= 0.5 ? Math.min(dst, 2 * src) : Math.max(dst, 2 * src - 1);
}

export const pinLight: BlendFormula = (sr, sg, sb, dr, dg, db) => [pinLightChannel(dr, sr), pinLightChannel(dg, sg), pinLightChannel(db, sb)];

interface PinLightProps extends ComponentPropsWithoutRef<"div"> {
	opacity?: number;
	flatten?: boolean;
	children?: ReactNode;
}

export function PinLight({ opacity, flatten, children, ...rest }: PinLightProps) {
	return (
		<RasterBlend blend={pinLight} opacity={opacity} flatten={flatten} {...rest}>
			{children}
		</RasterBlend>
	);
}
