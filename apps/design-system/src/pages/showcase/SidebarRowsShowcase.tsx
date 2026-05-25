import { SidebarRow, tokens, type SidebarItem } from "pictel";
import type { CSSProperties } from "react";

const sidebarShellStyle: CSSProperties = {
	width: 200,
	backgroundColor: tokens.color.panel,
	borderRight: `1px solid ${tokens.color.border}`,
	padding: `${String(tokens.space[2])}px 0`,
	boxSizing: "border-box",
};

const DEFAULT_ROW: SidebarItem = { name: "Default row", dimensions: "1080×1080" };
const HOVER_ROW: SidebarItem = { name: "Hover row", dimensions: "1500×500" };
const SELECTED_ROW: SidebarItem = { name: "Selected row", dimensions: "16:9" };

export function SidebarRowsShowcase() {
	const noopSelect = () => {
		/* showcase only */
	};

	return (
		<div style={sidebarShellStyle}>
			<SidebarRow item={DEFAULT_ROW} selected={false} onSelect={noopSelect} />
			<SidebarRow item={HOVER_ROW} selected={false} onSelect={noopSelect} forcedState="hover" />
			<SidebarRow item={SELECTED_ROW} selected={false} onSelect={noopSelect} forcedState="selected" />
		</div>
	);
}
