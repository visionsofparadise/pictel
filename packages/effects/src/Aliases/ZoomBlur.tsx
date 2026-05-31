import type { ReactNode } from "react";
import { useCanvasContext } from "pictel";
import { LIC } from "../Effects/LIC";
import { VectorField } from "../Generative/VectorField";

interface ZoomBlurProps {
	centerX?: number;
	centerY?: number;
	length?: number;
	children: ReactNode;
}

/**
 * Wraps `LIC` over a radial `VectorField` with linear magnitude — zoom blur from
 * a focal point.
 *
 * Streamlines radiate outward from `(centerX, centerY)` and lengthen with
 * radius, producing sharp pixels at the centre and long streaks toward the
 * edges. `stepSize` is baked at 1; `length` reads as pixels of streak per
 * direction at maximum magnitude.
 *
 * - `centerX` — Horizontal focal point as a fraction of width. Default 0.5.
 * - `centerY` — Vertical focal point as a fraction of height. Default 0.5.
 * - `length` — Streak length in steps per direction. Default 20.
 *
 * @param props
 * @category Aliases
 */
export function ZoomBlur({ centerX = 0.5, centerY = 0.5, length = 20, children }: ZoomBlurProps) {
	const { dimensions } = useCanvasContext();

	return (
		<LIC
			length={length}
			stepSize={1}
			map={
				<VectorField
					pattern="radial"
					magnitude="linear"
					centerX={centerX}
					centerY={centerY}
					width={dimensions.width}
					height={dimensions.height}
				/>
			}
		>
			{children}
		</LIC>
	);
}
