import type { ReactNode } from "react";
import { Overflow } from "./Overflow";

interface ClipProps {
	children: ReactNode;
}

/**
 * Clips a wrapped pipeline's bleed back to its content footprint.
 *
 * Composes `Overflow` — which exposes bleed at natural pixel ratio — inside
 * an `overflow: hidden` container sized to the raster effect's content. The bleed
 * extends outside the raster effect via `Overflow` and is then cropped at the
 * content edges by the outer.
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
