import type { ReactNode } from "react";
import { useCanvasContext } from "pictel";
import { Multiply } from "../BlendModes/Multiply";
import { RadialGradient } from "../Generative/RadialGradient";

interface VignetteProps {
	color?: string;
	radius?: number;
	softness?: number;
	children: ReactNode;
}

/**
 * Wraps `Multiply` of children by a `RadialGradient` from inner white to outer
 * `color` — vignette.
 *
 * The radial gradient runs `[white at 0, white at softness, color at 1]` so the
 * centre is untouched and the edges darken (or tint) toward `color`.
 *
 * - `color` — Outer colour the edges multiply toward. Default `"rgba(0, 0, 0, 1)"`.
 * - `radius` — Gradient radius as a fraction of the smaller dimension. Default 0.75.
 * - `softness` — Inner radius below which no darkening occurs, as a position on the
 *   gradient (0–1). Default 0.4.
 *
 * @param props
 * @category Aliases
 */
export function Vignette({
	color = "rgba(0, 0, 0, 1)",
	radius = 0.75,
	softness = 0.4,
	children,
}: VignetteProps) {
	const { dimensions } = useCanvasContext();

	const stops = [
		{ color: "rgba(255, 255, 255, 1)", position: 0 },
		{ color: "rgba(255, 255, 255, 1)", position: softness },
		{ color, position: 1 },
	];

	return (
		<Multiply
			apply={
				<RadialGradient
					width={dimensions.width}
					height={dimensions.height}
					radius={radius}
					stops={stops}
				/>
			}
		>
			{children}
		</Multiply>
	);
}
