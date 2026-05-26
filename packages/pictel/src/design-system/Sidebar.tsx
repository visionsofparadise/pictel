import type { CSSProperties } from "react";
import { tokens } from "./tokens";
import { SidebarRow, type SidebarItem } from "./SidebarRow";

interface SidebarProps {
	items: Array<SidebarItem>;
	activeName: string | null;
	onSelect: (name: string) => void;
}

const sidebarStyle: CSSProperties = {
	width: 200,
	minWidth: 200,
	height: "100%",
	backgroundColor: tokens.color.panel,
	borderRight: `1px solid ${tokens.color.border}`,
	overflowY: "auto",
	boxSizing: "border-box",
};

export function Sidebar({ items, activeName, onSelect }: SidebarProps) {
	return (
		<div style={sidebarStyle}>
			{items.map((item) => (
				<SidebarRow
					key={item.name}
					item={item}
					selected={item.name === activeName}
					onSelect={onSelect}
				/>
			))}
		</div>
	);
}
