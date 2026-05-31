import type { ReactNode } from "react";
import { useCanvasContext } from "pictel";
import { LIC } from "../Effects/LIC";
import { VectorField } from "../Generative/VectorField";

interface SwirlBlurProps {
	centerX?: number;
	centerY?: number;
	length?: number;
	children: ReactNode;
}

/**
 * Wraps `LIC` over a tangential `VectorField` — streaks rotate around a centre.
 *
 * Streamlines follow circular arcs around `(centerX, centerY)`, producing a
 * vortex-like smear. `stepSize` is baked at 1 and `uniformStep` is on, so all
 * pixels integrate the same arc length regardless of distance from the centre.
 *
 * - `centerX` — Horizontal centre as a fraction of width. Default 0.5.
 * - `centerY` — Vertical centre as a fraction of height. Default 0.5.
 * - `length` — Streak length in pixels per direction. Default 20.
 *
 * @param props
 * @category Aliases
 */
export function SwirlBlur({ centerX = 0.5, centerY = 0.5, length = 20, children }: SwirlBlurProps) {
	const { dimensions } = useCanvasContext();

	return (
		<LIC
			length={length}
			stepSize={1}
			uniformStep
			map={
				<VectorField
					pattern="tangential"
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
