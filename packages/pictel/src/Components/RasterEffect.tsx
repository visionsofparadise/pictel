import { useCallback, type ComponentPropsWithoutRef, type ReactNode } from "react";
import type { EffectResult } from "../pipeline/raster";
import { CompositeEffect } from "./CompositeEffect";
import { TargetEffect } from "./TargetEffect";
import { hasTargetChildren } from "./utils/has-target-children";
import { wrapWithMixBlend } from "./utils/wrap-with-mix-blend";

export type RasterEffectCallback = (pixels: ImageData, map?: ImageData) => ImageData | EffectResult | Promise<ImageData | EffectResult>;

type RasterEffectProps = {
	effect: RasterEffectCallback;
	mappedEffect?: (pixels: ImageData, map: ImageData) => ImageData | EffectResult | Promise<ImageData | EffectResult>;
	mode?: "parameter" | "mix";
	backdrop?: boolean;
	flatten?: boolean;
	children?: ReactNode;
} & ComponentPropsWithoutRef<"div">;

export function RasterEffect({
	effect,
	mappedEffect,
	mode = "mix",
	backdrop,
	flatten,
	children,
	...rest
}: RasterEffectProps) {
	const useComposite = (backdrop ?? false) || !hasTargetChildren(children);

	const targetCallback = useCallback(
		(childPixels: ImageData, mapPixels?: ImageData) => {
			if (!mapPixels) return effect(childPixels);

			if (mode === "parameter" && mappedEffect) {
				return mappedEffect(childPixels, mapPixels);
			}

			return wrapWithMixBlend(effect, childPixels, mapPixels);
		},
		[effect, mappedEffect, mode],
	);

	const compositeCallback = useCallback(
		(_selfPixels: ImageData, behindPixels: ImageData, mapPixels?: ImageData) => {
			if (!mapPixels) return effect(behindPixels);

			if (mode === "parameter" && mappedEffect) {
				return mappedEffect(behindPixels, mapPixels);
			}

			return wrapWithMixBlend(effect, behindPixels, mapPixels);
		},
		[effect, mappedEffect, mode],
	);

	if (useComposite) {
		return (
			<CompositeEffect effect={compositeCallback} flatten={flatten} {...rest}>
				{children}
			</CompositeEffect>
		);
	}

	return (
		<TargetEffect effect={targetCallback} flatten={flatten} {...rest}>
			{children}
		</TargetEffect>
	);
}
