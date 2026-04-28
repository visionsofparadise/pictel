import type { CSSProperties, ReactNode } from "react";

interface DemoDisplayTileProps {
	children: ReactNode;
	overlay?: ReactNode;
}

const outerStyle: CSSProperties = {
	position: "relative",
	width: "100%",
	height: "100%",
	overflow: "hidden",
	boxSizing: "border-box",
};

const contentStyle: CSSProperties = {
	position: "absolute",
	inset: 0,
};

/**
 * Static recreation of display-mode canvas chrome — composition fills the
 * frame, no workspace gutter. Used to demonstrate floating chrome states.
 */
export function DemoDisplayTile({ children, overlay }: DemoDisplayTileProps) {
	return (
		<div style={outerStyle}>
			<div style={contentStyle}>{children}</div>
			{overlay}
		</div>
	);
}
