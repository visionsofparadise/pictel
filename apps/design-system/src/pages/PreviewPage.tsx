import { useState, type CSSProperties, type ReactNode } from "react";
import { SidebarRow, tokens } from "pictel";
import { DemoErrorChip, type DemoError } from "../demo/DemoErrorChip";
import { DemoLoadingOverlay } from "../demo/DemoLoadingOverlay";
import { DemoPreviewTile } from "../demo/DemoPreviewTile";

interface PreviewEntry {
	name: string;
	dimensions: { width: number; height: number };
	render: () => ReactNode;
}

const wrapperStyle: CSSProperties = {
	display: "flex",
	width: "100%",
	height: "100%",
	overflow: "hidden",
	backgroundColor: tokens.color.bg,
};

const sidebarStyle: CSSProperties = {
	width: 200,
	minWidth: 200,
	height: "100%",
	backgroundColor: tokens.color.panel,
	borderRight: `1px solid ${tokens.color.border}`,
	overflowY: "auto",
	boxSizing: "border-box",
};

const mainStyle: CSSProperties = {
	flex: 1,
	height: "100%",
	overflow: "hidden",
	position: "relative",
};

const contentBaseStyle: CSSProperties = {
	width: "100%",
	height: "100%",
};

const blueNoiseContent: CSSProperties = {
	...contentBaseStyle,
	background:
		"radial-gradient(circle at 20% 30%, #6ea3d8 0%, transparent 35%), radial-gradient(circle at 75% 65%, #4a78b3 0%, transparent 40%), radial-gradient(circle at 50% 90%, #2e4f7a 0%, transparent 50%), linear-gradient(135deg, #1e3a5f 0%, #0f1f33 100%)",
};

const sunsetGradientContent: CSSProperties = {
	...contentBaseStyle,
	background: "linear-gradient(20deg, #0f172a 0%, #7c3aed 55%, #fbbf24 100%)",
};

const oliveNoiseContent: CSSProperties = {
	...contentBaseStyle,
	background:
		"radial-gradient(circle at 30% 40%, #b8c977 0%, transparent 40%), radial-gradient(circle at 70% 70%, #8fa055 0%, transparent 45%), linear-gradient(135deg, #5a6a3a 0%, #3a4824 100%)",
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

const entries: Array<PreviewEntry> = [
	{
		name: "Square 1080",
		dimensions: { width: 1080, height: 1080 },
		render: () => (
			<DemoPreviewTile aspect={1}>
				<div style={blueNoiseContent} />
			</DemoPreviewTile>
		),
	},
	{
		name: "Banner 1500x500",
		dimensions: { width: 1500, height: 500 },
		render: () => (
			<DemoPreviewTile aspect={3}>
				<div style={sunsetGradientContent} />
			</DemoPreviewTile>
		),
	},
	{
		name: "Aspect 16:9",
		dimensions: { width: 1600, height: 900 },
		render: () => (
			<DemoPreviewTile aspect={16 / 9}>
				<div style={oliveNoiseContent} />
			</DemoPreviewTile>
		),
	},
	{
		name: "Loading state",
		dimensions: { width: 1080, height: 1080 },
		render: () => (
			<DemoPreviewTile
				aspect={1}
				overlay={<DemoLoadingOverlay />}
				renderDisabled={true}
			>
				<div style={blueNoiseContent} />
			</DemoPreviewTile>
		),
	},
	{
		name: "Error state",
		dimensions: { width: 1080, height: 1080 },
		render: () => (
			<DemoPreviewTile
				aspect={1}
				overlay={<DemoErrorChip errors={demoErrors} />}
				renderDisabled={true}
			>
				<div style={blueNoiseContent} />
			</DemoPreviewTile>
		),
	},
];

function formatDimensions(d: { width: number; height: number }): string {
	return `${String(d.width)}×${String(d.height)}`;
}

export function PreviewPage() {
	const [activeName, setActiveName] = useState(entries[0].name);
	const active = entries.find((e) => e.name === activeName) ?? entries[0];

	return (
		<div style={wrapperStyle}>
			<div style={sidebarStyle}>
				{entries.map((entry) => (
					<SidebarRow
						key={entry.name}
						item={{ name: entry.name, dimensions: formatDimensions(entry.dimensions) }}
						selected={entry.name === active.name}
						onSelect={setActiveName}
					/>
				))}
			</div>
			<div style={mainStyle}>{active.render()}</div>
		</div>
	);
}
