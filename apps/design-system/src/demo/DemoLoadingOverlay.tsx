import type { CSSProperties } from "react";
import { tokens } from "pictel";

const darkenStyle: CSSProperties = {
	position: "absolute",
	inset: 0,
	backgroundColor: tokens.color.loadingOverlay,
	pointerEvents: "none",
	zIndex: 9,
};

const spinnerWrapStyle: CSSProperties = {
	position: "absolute",
	bottom: tokens.space[4],
	right: tokens.space[4],
	pointerEvents: "none",
	zIndex: 10,
};

const spinnerStyle: CSSProperties = {
	width: 24,
	height: 24,
	borderRadius: "50%",
	border: `2.5px solid transparent`,
	borderTopColor: tokens.color.text,
	borderRightColor: tokens.color.text,
	animation: "pictel-demo-spin 0.8s linear infinite",
};

const keyframesCss = "@keyframes pictel-demo-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }";

/**
 * Local recreation of the loading overlay for design iteration.
 * NOT used by pictel. Edit freely without rebuilding pictel.
 */
export function DemoLoadingOverlay() {
	return (
		<>
			<style>{keyframesCss}</style>
			<div style={darkenStyle} />
			<div style={spinnerWrapStyle}>
				<div style={spinnerStyle} />
			</div>
		</>
	);
}
