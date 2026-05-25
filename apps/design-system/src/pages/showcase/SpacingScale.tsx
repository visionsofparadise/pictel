import { tokens } from "pictel";
import type { CSSProperties } from "react";

const spacingListStyle: CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: tokens.space[3],
};

const spacingRowStyle: CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: tokens.space[3],
};

const spacingBarStyle = (px: number): CSSProperties => ({
	width: px,
	height: 16,
	backgroundColor: tokens.color.panelRaised,
	border: `1px solid ${tokens.color.border}`,
	boxSizing: "border-box",
});

const spacingLabelStyle: CSSProperties = {
	fontFamily: tokens.font.mono,
	fontSize: tokens.text.xs,
	color: tokens.color.textSecondary,
	letterSpacing: "0.02em",
	fontVariantNumeric: "tabular-nums",
};

export function SpacingScale() {
	const entries = Object.entries(tokens.space) as Array<[string, number]>;

	return (
		<div style={spacingListStyle}>
			{entries.map(([key, px]) => (
				<div key={key} style={spacingRowStyle}>
					<div style={spacingBarStyle(px)} />
					<span style={spacingLabelStyle}>
						space.{key} · {String(px)}px
					</span>
				</div>
			))}
		</div>
	);
}
