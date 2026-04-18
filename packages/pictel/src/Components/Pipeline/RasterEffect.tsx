import { useCallback, type ReactNode } from "react";
import type { EffectResult } from "../utils/raster";
import { CompositeEffect } from "./CompositeEffect";
import { TargetEffect } from "./TargetEffect";
import { hasTargetChildren } from "./utils/has-target-children";
import { wrapWithMixBlend } from "./utils/wrap-with-mix-blend";

export type RasterEffectCallback = (pixels: ImageData, map?: ImageData) => ImageData | EffectResult | Promise<ImageData | EffectResult>;

interface RasterEffectProps {
	/** Pixel callback applied to captured content. Receives ImageData and optional map ImageData. */
	effect: RasterEffectCallback;
	/** Alternative callback used when a map is present and mode is `"parameter"`. Receives content and map ImageData. */
	mappedEffect?: (pixels: ImageData, map: ImageData) => ImageData | EffectResult | Promise<ImageData | EffectResult>;
	mode?: "parameter" | "mix";
	backdrop?: boolean;
	children: ReactNode;
}

/**
 * Routing component for pixel-level effects. Detects whether children contain
 * content targets or only map inputs, and delegates to TargetEffect or CompositeEffect.
 *
 * - `effect` — Pixel callback applied to captured content. Receives ImageData and optional map ImageData.
 * - `mappedEffect` — Alternative callback used when a map is present and mode is `"parameter"`. Receives content and map ImageData.
 *
 * @param props
 * @category Pipeline
 */
export function RasterEffect({
	effect,
	mappedEffect,
	mode = "mix",
	backdrop,
	children,
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
			<CompositeEffect effect={compositeCallback}>
				{children}
			</CompositeEffect>
		);
	}

	return (
		<TargetEffect effect={targetCallback}>
			{children}
		</TargetEffect>
	);
}
