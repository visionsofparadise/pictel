import { tokens } from "pictel";
import type { CSSProperties, ReactNode } from "react";

const sectionStyle: CSSProperties = {
	marginBottom: tokens.space[6],
};

const sectionHeadingStyle: CSSProperties = {
	fontFamily: tokens.font.ui,
	fontSize: tokens.text.md,
	fontWeight: 500,
	color: tokens.color.text,
	marginTop: 0,
	marginBottom: tokens.space[3],
};

export function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section style={sectionStyle}>
			<h2 style={sectionHeadingStyle}>{title}</h2>
			{children}
		</section>
	);
}
