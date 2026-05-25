import { tokens } from "pictel";
import type { CSSProperties } from "react";

const TYPE_SAMPLES: Array<{
	fontKey: "ui" | "mono";
	sizeKey: "xs" | "sm" | "md";
}> = [
	{ fontKey: "ui", sizeKey: "xs" },
	{ fontKey: "ui", sizeKey: "sm" },
	{ fontKey: "ui", sizeKey: "md" },
	{ fontKey: "mono", sizeKey: "xs" },
	{ fontKey: "mono", sizeKey: "sm" },
	{ fontKey: "mono", sizeKey: "md" },
];

const SAMPLE_STRING = "Pictel Canvas — 1080×1080";

const typeListStyle: CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: tokens.space[3],
};

const typeRowStyle: CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: tokens.space[1],
};

const typeMetaStyle: CSSProperties = {
	fontFamily: tokens.font.mono,
	fontSize: tokens.text.xs,
	color: tokens.color.textSecondary,
	letterSpacing: "0.02em",
	fontVariantNumeric: "tabular-nums",
};

const TEXT_PX_BY_KEY: Record<"xs" | "sm" | "md", number> = { xs: 11, sm: 13, md: 16 };

export function TypographySamples() {
	return (
		<div style={typeListStyle}>
			{TYPE_SAMPLES.map(({ fontKey, sizeKey }) => {
				const sampleStyle: CSSProperties = {
					fontFamily: tokens.font[fontKey],
					fontSize: tokens.text[sizeKey],
					color: tokens.color.text,
					fontWeight: 400,
					letterSpacing: sizeKey === "xs" ? "0.02em" : undefined,
					fontVariantNumeric: fontKey === "mono" ? "tabular-nums" : undefined,
				};

				return (
					<div key={`${fontKey}-${sizeKey}`} style={typeRowStyle}>
						<span style={sampleStyle}>{SAMPLE_STRING}</span>
						<span style={typeMetaStyle}>
							font.{fontKey} / text.{sizeKey} / {tokens.text[sizeKey]} ({String(TEXT_PX_BY_KEY[sizeKey])}px)
						</span>
					</div>
				);
			})}
		</div>
	);
}
