import { tokens } from "pictel";
import type { CSSProperties } from "react";
import { ColorSwatches } from "./showcase/ColorSwatches";
import { ErrorChipShowcase } from "./showcase/ErrorChipShowcase";
import { LoadingOverlayShowcase } from "./showcase/LoadingOverlayShowcase";
import { RenderStripShowcase } from "./showcase/RenderStripShowcase";
import { Section } from "./showcase/Section";
import { SidebarRowsShowcase } from "./showcase/SidebarRowsShowcase";
import { SpacingScale } from "./showcase/SpacingScale";
import { TypographySamples } from "./showcase/TypographySamples";
import { subheadingStyle } from "./showcase/utils/styles";

const pageStyle: CSSProperties = {
	padding: tokens.space[6],
	color: tokens.color.text,
	fontFamily: tokens.font.ui,
	backgroundColor: tokens.color.bg,
	minHeight: "100%",
	boxSizing: "border-box",
};

const componentBlockStyle: CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: tokens.space[4],
};

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
