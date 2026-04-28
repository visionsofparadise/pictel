import type { CSSProperties } from "react";
import { tokens } from "pictel";
import { DemoDisplayTile } from "../demo/DemoDisplayTile";
import { DemoErrorChip, type DemoError } from "../demo/DemoErrorChip";
import { DemoLoadingOverlay } from "../demo/DemoLoadingOverlay";

const pageStyle: CSSProperties = {
	width: "100%",
	minHeight: "100%",
	backgroundColor: "#fde047",
	padding: tokens.space[6],
	boxSizing: "border-box",
	display: "flex",
	flexDirection: "column",
	gap: tokens.space[4],
};

const labelStyle: CSSProperties = {
	fontFamily: tokens.font.ui,
	fontSize: tokens.text.sm,
	color: "#1f1300",
	letterSpacing: "0.02em",
	margin: 0,
};

const sectionLabelStyle: CSSProperties = {
	fontFamily: tokens.font.ui,
	fontSize: tokens.text.xs,
	color: "#1f1300",
	letterSpacing: "0.04em",
	textTransform: "uppercase",
	margin: 0,
};

const tileStyle: CSSProperties = {
	width: "100%",
	maxWidth: 720,
	height: 405,
	position: "relative",
};

const sampleGradient: CSSProperties = {
	width: "100%",
	height: "100%",
	background: "linear-gradient(45deg, #0f172a, #7c3aed, #fbbf24)",
};

const sectionStyle: CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: tokens.space[2],
};

const demoErrors: Array<DemoError> = [
	{
		id: "blur",
		message: "Failed to capture map child: image decode timeout",
	},
	{
		id: "depth-map",
		message: "WebGPU adapter unavailable; ensure your browser supports WebGPU.",
	},
];

export function DisplayPage() {
	return (
		<div style={pageStyle}>
			<p style={labelStyle}>
				display mode — composition fills space, chip + spinner float over imagery, no workspace gutter
			</p>

			<div style={sectionStyle}>
				<p style={sectionLabelStyle}>Default</p>
				<div style={tileStyle}>
					<DemoDisplayTile>
						<div style={sampleGradient} />
					</DemoDisplayTile>
				</div>
			</div>

			<div style={sectionStyle}>
				<p style={sectionLabelStyle}>Loading state</p>
				<div style={tileStyle}>
					<DemoDisplayTile overlay={<DemoLoadingOverlay />}>
						<div style={sampleGradient} />
					</DemoDisplayTile>
				</div>
			</div>

			<div style={sectionStyle}>
				<p style={sectionLabelStyle}>Error state</p>
				<div style={tileStyle}>
					<DemoDisplayTile overlay={<DemoErrorChip errors={demoErrors} />}>
						<div style={sampleGradient} />
					</DemoDisplayTile>
				</div>
			</div>
		</div>
	);
}
