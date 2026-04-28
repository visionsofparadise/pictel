import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import {
	CanvasContext,
	ErrorChip,
	LoadingOverlay,
	RenderStrip,
	SidebarRow,
	tokens,
	type CanvasContextValue,
	type PipelineError,
	type SidebarItem,
} from "pictel";

const pageStyle: CSSProperties = {
	padding: tokens.space[6],
	color: tokens.color.text,
	fontFamily: tokens.font.ui,
	backgroundColor: tokens.color.bg,
	minHeight: "100%",
	boxSizing: "border-box",
};

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

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section style={sectionStyle}>
			<h2 style={sectionHeadingStyle}>{title}</h2>
			{children}
		</section>
	);
}

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

function ColorSwatches() {
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

function TypographySamples() {
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

function SpacingScale() {
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

const componentBlockStyle: CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: tokens.space[4],
};

const subheadingStyle: CSSProperties = {
	fontFamily: tokens.font.ui,
	fontSize: tokens.text.sm,
	color: tokens.color.textSecondary,
	letterSpacing: "0.02em",
	margin: 0,
	marginBottom: tokens.space[2],
};

const sidebarShellStyle: CSSProperties = {
	width: 200,
	backgroundColor: tokens.color.panel,
	borderRight: `1px solid ${tokens.color.border}`,
	padding: `${String(tokens.space[2])}px 0`,
	boxSizing: "border-box",
};

const DEFAULT_ROW: SidebarItem = { name: "Default row", dimensions: "1080×1080" };
const HOVER_ROW: SidebarItem = { name: "Hover row", dimensions: "1500×500" };
const SELECTED_ROW: SidebarItem = { name: "Selected row", dimensions: "16:9" };

function SidebarRowsShowcase() {
	const noopSelect = () => {
		/* showcase only */
	};

	return (
		<div style={sidebarShellStyle}>
			<SidebarRow item={DEFAULT_ROW} selected={false} onSelect={noopSelect} />
			<SidebarRow item={HOVER_ROW} selected={false} onSelect={noopSelect} forcedState="hover" />
			<SidebarRow item={SELECTED_ROW} selected={false} onSelect={noopSelect} forcedState="selected" />
		</div>
	);
}

/**
 * Minimal CanvasContext provider for showcase use. RenderStrip reads
 * `reportError` from CanvasContext; we supply a noop implementation plus the
 * other required fields so the chrome can render in isolation.
 */
function ShowcaseCanvasContext({ children }: { children: ReactNode }) {
	const noopRef = useRef<HTMLDivElement>(null);
	const snapshotRef = useRef(null);
	const maskDefsRef = useRef<SVGDefsElement>(null);

	const value: CanvasContextValue = {
		mode: "preview",
		dimensions: { width: 1080, height: 1080 },
		viewport: { width: 1080, height: 1080 },
		domSnapshot: snapshotRef,
		maskDefs: maskDefsRef,
		canvasRoot: noopRef,
		captureDimensions: { width: 1080, height: 1080 },
		reportError: () => {
			/* showcase noop */
		},
	};

	return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
}

const renderStripFrameStyle: CSSProperties = {
	position: "relative",
	width: "100%",
	height: 80,
	backgroundColor: tokens.color.workspace,
	border: `1px solid ${tokens.color.border}`,
	boxSizing: "border-box",
};

function RenderStripShowcase() {
	return (
		<ShowcaseCanvasContext>
			<div style={renderStripFrameStyle}>
				<RenderStrip canvasName="Demo" width={1080} height={1080} />
			</div>
		</ShowcaseCanvasContext>
	);
}

const SAMPLE_ERRORS: Array<PipelineError> = [
	{
		id: "blur-12",
		error: new Error("Cannot capture pipeline output: source canvas is empty."),
		timestamp: 1700000000000,
	},
	{
		id: "displacement-3",
		error: new Error("Map child resolved with no pixels — check that DepthMap finished."),
		timestamp: 1700000001000,
	},
];

const errorChipFrameStyle: CSSProperties = {
	position: "relative",
	width: 420,
	height: 220,
	backgroundColor: tokens.color.workspace,
	border: `1px solid ${tokens.color.border}`,
	boxSizing: "border-box",
};

/**
 * Wrapper that mounts an ErrorChip and synthesizes a `mouseenter` event on the
 * chip's root element after mount, forcing the expanded view without changing
 * ErrorChip's API.
 */
function ForcedExpandedErrorChip({ errors }: { errors: Array<PipelineError> }) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;

		if (!container) return;

		const chipRoot = container.firstElementChild;

		if (!(chipRoot instanceof HTMLElement)) return;

		chipRoot.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
	}, []);

	return (
		<div ref={containerRef} style={{ display: "contents" }}>
			<ErrorChip errors={errors} />
		</div>
	);
}

function ErrorChipShowcase() {
	return (
		<div style={{ display: "flex", gap: tokens.space[6] }}>
			<div>
				<p style={subheadingStyle}>Collapsed</p>
				<div style={errorChipFrameStyle}>
					<ErrorChip errors={SAMPLE_ERRORS} />
				</div>
			</div>
			<div>
				<p style={subheadingStyle}>Expanded</p>
				<div style={errorChipFrameStyle}>
					<ForcedExpandedErrorChip errors={SAMPLE_ERRORS} />
				</div>
			</div>
		</div>
	);
}

const loadingFrameStyle: CSSProperties = {
	position: "relative",
	width: 200,
	height: 200,
	backgroundColor: tokens.color.panelRaised,
	border: `1px solid ${tokens.color.border}`,
	boxSizing: "border-box",
};

function LoadingOverlayShowcase() {
	return (
		<div style={loadingFrameStyle}>
			<LoadingOverlay pending />
		</div>
	);
}

export function ShowcasePage() {
	return (
		<div style={pageStyle}>
			<Section title="Color">
				<ColorSwatches />
			</Section>
			<Section title="Typography">
				<TypographySamples />
			</Section>
			<Section title="Spacing">
				<SpacingScale />
			</Section>
			<Section title="Components">
				<div style={componentBlockStyle}>
					<div>
						<p style={subheadingStyle}>SidebarRow — default, hover, selected</p>
						<SidebarRowsShowcase />
					</div>
					<div>
						<p style={subheadingStyle}>RenderStrip</p>
						<RenderStripShowcase />
					</div>
					<div>
						<p style={subheadingStyle}>ErrorChip</p>
						<ErrorChipShowcase />
					</div>
					<div>
						<p style={subheadingStyle}>LoadingOverlay</p>
						<LoadingOverlayShowcase />
					</div>
				</div>
			</Section>
		</div>
	);
}
