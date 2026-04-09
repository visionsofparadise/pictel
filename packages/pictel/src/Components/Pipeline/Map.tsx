import type { ComponentProps, CSSProperties, ReactNode } from "react";

export type MapCompose = "intersect" | "add" | "subtract" | "exclude";

const composeToBlendMode: Record<MapCompose, CSSProperties["mixBlendMode"]> = {
	intersect: "multiply",
	add: "screen",
	subtract: "difference",
	exclude: "exclusion",
};

interface MapProps extends ComponentProps<"div"> {
	/** How multiple maps combine: `"intersect"` (multiply), `"add"` (screen), `"subtract"` (difference), `"exclude"` (exclusion). */
	compose?: MapCompose;
	children: ReactNode;
}

/**
 * Marks children as a map input for effects and blend modes. Map luminance
 * controls where and how strongly the parent effect is applied.
 *
 * - `compose` — How multiple maps combine: `"intersect"` (multiply), `"add"` (screen), `"subtract"` (difference), `"exclude"` (exclusion).
 *
 * @param props
 * @category Pipeline
 */
export function Map({ compose = "intersect", children, style, ...rest }: MapProps) {
	return (
		<div
			data-pictel-map
			style={{ ...style, mixBlendMode: composeToBlendMode[compose] }}
			{...rest}
		>
			{children}
		</div>
	);
}
