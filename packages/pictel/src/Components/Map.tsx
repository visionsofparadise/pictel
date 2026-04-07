import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";

export type MapCompose = "intersect" | "add" | "subtract" | "exclude";

const composeToBlendMode: Record<MapCompose, CSSProperties["mixBlendMode"]> = {
	intersect: "multiply",
	add: "screen",
	subtract: "difference",
	exclude: "exclusion",
};

type MapProps = {
	compose?: MapCompose;
	children: ReactNode;
} & ComponentPropsWithoutRef<"div">;

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
