import type { ReactNode } from "react";
import { Overflow } from "./Overflow";

interface ClipProps {
	children: ReactNode;
}

/**
 * Frames a wrapped effect at its content size, cropping any bleed (blur halos,
 * drop shadow falloff) back to the content edges. Useful when you want the soft
 * edges of an effect to render at natural scale internally but be clipped to a
 * crisp rectangular footprint in the layout.
 *
 * Wrap a single raster effect.
 *
 * - `children` — Required. A single raster effect to frame and crop.
 *
 * @param props
 * @category RasterEffect
 */
export function Clip({ children }: ClipProps) {
	return (
		<div style={{ overflow: "hidden" }}>
			<Overflow>{children}</Overflow>
		</div>
	);
}
