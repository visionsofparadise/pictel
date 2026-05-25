import { LoadingOverlay, tokens } from "pictel";
import type { CSSProperties } from "react";

const loadingFrameStyle: CSSProperties = {
	position: "relative",
	width: 200,
	height: 200,
	backgroundColor: tokens.color.panelRaised,
	border: `1px solid ${tokens.color.border}`,
	boxSizing: "border-box",
};

export function LoadingOverlayShowcase() {
	return (
		<div style={loadingFrameStyle}>
			<LoadingOverlay pending />
		</div>
	);
}
