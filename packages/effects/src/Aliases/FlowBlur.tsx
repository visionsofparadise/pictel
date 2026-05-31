import type { ReactNode } from "react";
import { Direction } from "../Effects/Sobel/Direction";
import { LIC } from "../Effects/LIC";

interface FlowBlurProps {
	length?: number;
	children: ReactNode;
}

/**
 * Wraps `LIC` over a `Direction mode="structure"` derived from children —
 * streaks follow the image's own structure.
 *
 * The structure field is Sobel-derived from the same children that get smeared,
 * so streamlines align with the image's contours. `stepSize` is baked at 1 and
 * `uniformStep` is on.
 *
 * - `length` — Streak length in pixels per direction. Default 20.
 *
 * @param props
 * @category Aliases
 */
export function FlowBlur({ length = 20, children }: FlowBlurProps) {
	return (
		<LIC
			length={length}
			stepSize={1}
			uniformStep
			map={<Direction mode="structure">{children}</Direction>}
		>
			{children}
		</LIC>
	);
}
