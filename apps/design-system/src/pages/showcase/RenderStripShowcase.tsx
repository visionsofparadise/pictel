import { RenderStrip, tokens } from "pictel";
import type { CSSProperties } from "react";
import { ShowcaseCanvasContext } from "./ShowcaseCanvasContext";

const renderStripFrameStyle: CSSProperties = {
	position: "relative",
	width: "100%",
	height: 80,
	backgroundColor: tokens.color.workspace,
	border: `1px solid ${tokens.color.border}`,
	boxSizing: "border-box",
};

export function RenderStripShowcase() {
	return (
		<ShowcaseCanvasContext>
			<div style={renderStripFrameStyle}>
				<RenderStrip canvasName="Demo" width={1080} height={1080} />
			</div>
		</ShowcaseCanvasContext>
	);
}
