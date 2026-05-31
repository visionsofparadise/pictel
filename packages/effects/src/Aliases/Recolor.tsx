import type { ReactNode } from "react";
import { Hue } from "../BlendModes/Hue";

interface RecolorProps {
	source: ReactNode;
	children: ReactNode;
}

/**
 * Wraps `Hue` blend — children take the hue of `source`, preserving their own
 * saturation and luminosity.
 *
 * `source` is any `ReactNode` carrying the hue reference (typically a
 * `LinearGradient`, `ConicGradient`, or `Image`).
 *
 * - `source` — Layer whose hue replaces the children's hue. Required.
 *
 * @param props
 * @category Aliases
 */
export function Recolor({ source, children }: RecolorProps) {
	return <Hue apply={source}>{children}</Hue>;
}
