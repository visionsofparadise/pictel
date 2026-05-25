import { useState, type CSSProperties } from "react";
import { tokens } from "./tokens";

export interface SidebarItem {
	name: string;
	dimensions: string;
}

const buttonResetStyle: CSSProperties = {
	appearance: "none",
	background: "none",
	border: "none",
	margin: 0,
	font: "inherit",
	color: "inherit",
	textAlign: "left",
	display: "block",
	width: "100%",
	cursor: "pointer",
};

interface SidebarRowProps {
	item: SidebarItem;
	selected: boolean;
	onSelect: (name: string) => void;
	/** Showcase-only override: forces the row's visual state regardless of hover/selected props. */
	forcedState?: "hover" | "selected";
}

/**
 * Single row in the Sidebar. Exported so the design-system showcase can render
 * forced-state instances (`default`, `hover`, `selected`) directly without
 * needing to script real interaction.
 */
export function SidebarRow({ item, selected, onSelect, forcedState }: SidebarRowProps) {
	const [hovered, setHovered] = useState(false);

	const isSelected = forcedState === "selected" || (forcedState === undefined && selected);
	const isHovered = forcedState === "hover" || (forcedState === undefined && hovered);

	const backgroundColor = isSelected || isHovered ? tokens.color.panelRaised : "transparent";

	const rowStyle: CSSProperties = {
		...buttonResetStyle,
		padding: `${String(tokens.space[3])}px ${String(tokens.space[4])}px`,
		backgroundColor,
	};

	const nameStyle: CSSProperties = {
		fontFamily: tokens.font.ui,
		fontSize: tokens.text.sm,
		color: tokens.color.text,
		fontWeight: isSelected ? 500 : 400,
		lineHeight: 1.3,
		display: "block",
	};

	const dimensionsStyle: CSSProperties = {
		fontFamily: tokens.font.mono,
		fontSize: tokens.text.xs,
		color: tokens.color.textSecondary,
		fontWeight: 400,
		letterSpacing: "0.02em",
		marginTop: tokens.space[1],
		fontVariantNumeric: "tabular-nums",
		display: "block",
	};

	const handleMouseEnter = forcedState === undefined ? () => setHovered(true) : undefined;
	const handleMouseLeave = forcedState === undefined ? () => setHovered(false) : undefined;

	return (
		<button
			type="button"
			style={rowStyle}
			onClick={() => onSelect(item.name)}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<span style={nameStyle}>{item.name}</span>
			<span style={dimensionsStyle}>{item.dimensions}</span>
		</button>
	);
}
