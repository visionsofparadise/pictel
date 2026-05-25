import { useState, type CSSProperties } from "react";
import { tokens } from "pictel";

const buttonResetStyle: CSSProperties = {
	appearance: "none",
	background: "none",
	border: "none",
	margin: 0,
	font: "inherit",
	color: "inherit",
	cursor: "pointer",
};

const tabBaseStyle: CSSProperties = {
	...buttonResetStyle,
	padding: `${String(tokens.space[3])}px ${String(tokens.space[4])}px`,
	fontFamily: tokens.font.ui,
	fontSize: tokens.text.sm,
	color: tokens.color.text,
};

interface TabProps {
	label: string;
	active: boolean;
	onSelect: () => void;
}

export function Tab({ label, active, onSelect }: TabProps) {
	const [hovered, setHovered] = useState(false);
	const background = active || hovered ? tokens.color.panelRaised : "transparent";
	const fontWeight = active ? 500 : 400;
	const style: CSSProperties = { ...tabBaseStyle, backgroundColor: background, fontWeight };

	return (
		<button
			type="button"
			style={style}
			onClick={onSelect}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{label}
		</button>
	);
}
