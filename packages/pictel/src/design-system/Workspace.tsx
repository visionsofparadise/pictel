import type { CSSProperties, ReactNode } from "react";
import { tokens } from "./tokens";

interface WorkspaceProps {
	children: ReactNode;
}

const workspaceStyle: CSSProperties = {
	position: "relative",
	width: "100%",
	height: "100%",
	backgroundColor: tokens.color.workspace,
	padding: tokens.space[16],
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	overflow: "auto",
	boxSizing: "border-box",
};

/**
 * Padded gutter wrapper for the composition in `preview` mode. Centers the
 * composition, scrolls if it exceeds the viewport, and provides the
 * `position: relative` anchor that floating chrome (error chip, render strip,
 * loading spinner) absolutely positions against.
 *
 * Floating chrome is rendered as siblings of the workspace by Canvas — the
 * workspace itself only knows about its single child slot.
 */
export function Workspace({ children }: WorkspaceProps) {
	return <div style={workspaceStyle}>{children}</div>;
}
