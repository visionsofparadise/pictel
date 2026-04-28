import { useState, type CSSProperties } from "react";
import { tokens } from "pictel";

type Format = "png" | "jpeg" | "webp";

interface DemoRenderStripProps {
	/** When true, the Render button is dimmed and click is a no-op. */
	renderDisabled?: boolean;
}

const containerStyle: CSSProperties = {
	position: "absolute",
	top: tokens.space[4],
	right: tokens.space[4],
	display: "flex",
	gap: tokens.space[2],
	alignItems: "center",
	zIndex: 10,
};

const selectStyle: CSSProperties = {
	backgroundColor: tokens.color.panel,
	color: tokens.color.text,
	border: `1px solid ${tokens.color.border}`,
	padding: `${String(tokens.space[2])}px ${String(tokens.space[3])}px`,
	fontSize: tokens.text.sm,
	fontFamily: tokens.font.ui,
	boxSizing: "border-box",
};

const qualityValueStyle: CSSProperties = {
	fontFamily: tokens.font.mono,
	fontSize: tokens.text.xs,
	color: tokens.color.textSecondary,
	fontVariantNumeric: "tabular-nums",
	letterSpacing: "0.02em",
	minWidth: 24,
	textAlign: "right",
};

const sliderContainerStyle: CSSProperties = {
	display: "flex",
	gap: tokens.space[1],
	alignItems: "center",
};

/**
 * Local recreation of the render strip for design iteration.
 * Click handlers are no-ops; the format selector and quality slider are
 * fully interactive for visual feedback.
 */
export function DemoRenderStrip({ renderDisabled = false }: DemoRenderStripProps) {
	const [format, setFormat] = useState<Format>("png");
	const [quality, setQuality] = useState(85);

	const showQuality = format !== "png";

	const buttonStyle: CSSProperties = {
		appearance: "none",
		padding: `${String(tokens.space[2])}px ${String(tokens.space[4])}px`,
		backgroundColor: tokens.color.panel,
		color: renderDisabled ? tokens.color.textDisabled : tokens.color.text,
		border: `1px solid ${tokens.color.border}`,
		fontSize: tokens.text.sm,
		fontFamily: tokens.font.ui,
		cursor: renderDisabled ? "not-allowed" : "pointer",
		boxSizing: "border-box",
	};

	return (
		<div style={containerStyle}>
			<select
				style={selectStyle}
				value={format}
				onChange={(event) => {
					setFormat(event.target.value as Format);
				}}
			>
				<option value="png">PNG</option>
				<option value="jpeg">JPEG</option>
				<option value="webp">WEBP</option>
			</select>
			{showQuality ? (
				<div style={sliderContainerStyle}>
					<input
						type="range"
						min={0}
						max={100}
						value={quality}
						onChange={(event) => {
							setQuality(Number(event.target.value));
						}}
					/>
					<span style={qualityValueStyle}>{quality}</span>
				</div>
			) : null}
			<button
				type="button"
				style={buttonStyle}
				disabled={renderDisabled}
				onClick={() => {
					/* demo: no-op */
				}}
			>
				Render
			</button>
		</div>
	);
}
