import { tokens } from "pictel";
import type { CSSProperties } from "react";

const swatchGridStyle: CSSProperties = {
	display: "flex",
	flexWrap: "wrap",
	gap: tokens.space[3],
};

const swatchCellStyle: CSSProperties = {
	display: "flex",
	flexDirection: "column",
	alignItems: "flex-start",
	gap: tokens.space[1],
	width: 80,
};

const swatchSquareStyle = (color: string): CSSProperties => ({
	width: 80,
	height: 80,
	backgroundColor: color,
	border: `1px solid ${tokens.color.border}`,
	boxSizing: "border-box",
});

const swatchNameStyle: CSSProperties = {
	fontFamily: tokens.font.ui,
	fontSize: tokens.text.xs,
	color: tokens.color.text,
	letterSpacing: "0.02em",
};

const swatchHexStyle: CSSProperties = {
	fontFamily: tokens.font.mono,
	fontSize: tokens.text.xs,
	color: tokens.color.textSecondary,
	fontVariantNumeric: "tabular-nums",
	letterSpacing: "0.02em",
};

export function ColorSwatches() {
	const entries = Object.entries(tokens.color);

	return (
		<div style={swatchGridStyle}>
			{entries.map(([name, hex]) => (
				<div key={name} style={swatchCellStyle}>
					<span style={swatchNameStyle}>{name}</span>
					<div style={swatchSquareStyle(hex)} />
					<span style={swatchHexStyle}>{hex}</span>
				</div>
			))}
		</div>
	);
}
