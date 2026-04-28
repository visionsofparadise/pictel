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
	// Minimum gutter must clear the floating chrome (error chip top-left,
	// render strip top-right, loading spinner bottom-right) so the canvas
	// frame is never covered. Chrome offset is space[4]=16px from the canvas
	// root edge, max chrome height ~40px (render strip) + small gap → 64px.
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
