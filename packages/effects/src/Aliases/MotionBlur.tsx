import type { ReactNode } from "react";
import { useCanvasContext } from "pictel";
import { LIC } from "../Effects/LIC";
import { VectorField } from "../Generative/VectorField";

interface MotionBlurProps {
	angle?: number;
	length?: number;
	children: ReactNode;
}

/**
 * Wraps `LIC` over a linear `VectorField` — directional motion blur.
 *
 * Streamlines run at a constant angle across the frame, so children smear in a
 * single direction. `stepSize` is baked at 1; `length` reads as pixels of streak
 * per direction.
 *
 * - `angle` — Direction of the smear in degrees. 0 is left-to-right. Default 0.
 * - `length` — Streak length in pixels per direction. Default 20.
 *
 * @param props
 * @category Aliases
 */
export function MotionBlur({ angle = 0, length = 20, children }: MotionBlurProps) {
	const { dimensions } = useCanvasContext();

	return (
		<LIC
			length={length}
			stepSize={1}
			uniformStep
			map={
				<VectorField
					pattern="linear"
					angle={angle}
					width={dimensions.width}
					height={dimensions.height}
				/>
			}
		>
			{children}
		</LIC>
	);
}
