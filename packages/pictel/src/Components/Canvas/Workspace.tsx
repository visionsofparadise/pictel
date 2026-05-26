import type { CSSProperties, ReactNode } from "react";
import { tokens } from "../../tokens";

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

export function Workspace({ children }: WorkspaceProps) {
	return <div style={workspaceStyle}>{children}</div>;
}
