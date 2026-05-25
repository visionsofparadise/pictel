import { tokens } from "pictel";
import type { CSSProperties } from "react";

export const subheadingStyle: CSSProperties = {
	fontFamily: tokens.font.ui,
	fontSize: tokens.text.sm,
	color: tokens.color.textSecondary,
	letterSpacing: "0.02em",
	margin: 0,
	marginBottom: tokens.space[2],
};
