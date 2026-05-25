import type { CSSProperties, ReactNode } from "react";
import { tokens } from "pictel";
import { DemoRenderStrip } from "./DemoRenderStrip";

interface DemoPreviewTileProps {
	/** Sample content rendered inside the checkerboard frame. */
	children: ReactNode;
	/** Aspect ratio of the demo composition (width / height). */
	aspect: number;
	/** Floating chrome to overlay on top (loading overlay, error chip, etc.). */
	overlay?: ReactNode;
	/** Whether to render the demo render strip in the top-right. Default true. */
	showRenderStrip?: boolean;
	/** Whether the Render button on the strip should be disabled. */
	renderDisabled?: boolean;
}

const checkerboard = "repeating-conic-gradient(#e0e0e0 0% 25%, #ffffff 0% 50%) 0 0 / 16px 16px";

const outerStyle: CSSProperties = {
	position: "relative",
	width: "100%",
	height: "100%",
	backgroundColor: tokens.color.bg,
	overflow: "hidden",
	boxSizing: "border-box",
};

const workspaceStyle: CSSProperties = {
	position: "relative",
	width: "100%",
	height: "100%",
	backgroundColor: tokens.color.workspace,
	padding: tokens.space[16],
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	boxSizing: "border-box",
};

/**
 * Static recreation of preview-mode canvas chrome (workspace gutter +
 * checkerboard frame + render strip). Used to demonstrate floating chrome
 * states without going through the real pictel Canvas.
 */
export function DemoPreviewTile({ children, aspect, overlay, showRenderStrip = true, renderDisabled = false }: DemoPreviewTileProps) {
	const frameStyle: CSSProperties = {
		aspectRatio: String(aspect),
		maxWidth: "100%",
		maxHeight: "100%",
		background: checkerboard,
		position: "relative",
		overflow: "hidden",
		width: aspect >= 1 ? "100%" : "auto",
		height: aspect >= 1 ? "auto" : "100%",
	};

	const contentStyle: CSSProperties = {
		position: "absolute",
		inset: 0,
	};

	return (
		<div style={outerStyle}>
			<div style={workspaceStyle}>
				<div style={frameStyle}>
					<div style={contentStyle}>{children}</div>
				</div>
			</div>
			{showRenderStrip ? <DemoRenderStrip renderDisabled={renderDisabled} /> : null}
			{overlay}
		</div>
	);
}
