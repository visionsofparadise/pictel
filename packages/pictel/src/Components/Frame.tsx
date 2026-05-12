import type { CSSProperties, ReactNode } from "react";
import { useCanvasContext } from "../context/canvas";
import { tokens } from "../design-system/tokens";

interface FrameProps {
	children?: ReactNode;
}

/**
 * Visual frame around the composition. Layout always sizes to the fixed
 * `dimensions` from CanvasContext (the buffer is fixed; capture is decoupled
 * from container size). Modes differ in how the buffer-sized box is presented:
 *
 * - **preview**: Frame paints a checkerboard background and applies a
 *   `transform: scale(scaleFactor)` to fit the buffer-sized box into the
 *   workspace viewport. Buffer pixels are 1:1 with composition pixels;
 *   the visual scale is for display only.
 * - **display**: Frame applies `max-width: 100%; max-height: 100%; height: auto`
 *   so the buffer-sized box scales like an `<img>` to fit the host container.
 *   Buffer dims stay fixed; the rendered surface scales visually.
 * - **render**: Frame renders at the literal pixel size with no chrome.
 */
export function Frame({ children }: FrameProps) {
	const { mode, dimensions, viewport } = useCanvasContext();
	const { width, height } = dimensions;

	// Frame is a fixed-size box. Its single in-flow child is the composition's
	// outermost pipeline (or generative). To give the children chain a definite
	// parent height — so `height:100%` on a generative component's wrapper
	// resolves to the buffer height instead of collapsing through a canvas's
	// intrinsic 2:1 ratio — Frame uses `display: flex; flex-direction: column`
	// with one child wrapper that gets `flex: 1; min-height: 0` plus `display:
	// flex; flex-direction: column` of its own. The pipeline child then sits in
	// THAT wrapper and gets full height via flex. The wrapper also makes width
	// stretch to Frame's content box.
	const containerStyle: CSSProperties = {
		width,
		height,
		position: "relative",
		overflow: "hidden",
		display: "flex",
		flexDirection: "column",
		alignItems: "stretch",
	};
	const innerStyle: CSSProperties = {
		flex: "1 1 auto",
		display: "flex",
		flexDirection: "column",
		alignItems: "stretch",
		minHeight: 0,
		minWidth: 0,
		position: "relative",
	};

	if (mode === "preview") {
		const checkerboard = "repeating-conic-gradient(#e0e0e0 0% 25%, #ffffff 0% 50%) 0 0 / 16px 16px";
		// Preview-mode Frame lives inside Workspace, which adds a padded gutter
		// on all sides. Subtract that padding so the scaled Frame fits inside
		// the gutter (otherwise the post-scale layout box equals viewport,
		// overflowing the workspace's content box and triggering scrollbars).
		const workspacePad = tokens.space[16] * 2;
		const availW = Math.max(0, viewport.width - workspacePad);
		const availH = Math.max(0, viewport.height - workspacePad);
		const scaleFactor = availW === 0 || availH === 0 ? 1 : Math.min(availW / width, availH / height, 1);

		// Outer box has the post-scale layout dims; inner has full buffer dims
		// with transform:scale anchored top-left. Layout box matches visual
		// box, so the workspace doesn't see oversized children.
		const outerStyle: CSSProperties = {
			width: width * scaleFactor,
			height: height * scaleFactor,
			flexShrink: 0,
			position: "relative",
			overflow: "hidden",
		};
		const scaledStyle: CSSProperties = {
			...containerStyle,
			flexShrink: 0,
			transform: `scale(${String(scaleFactor)})`,
			transformOrigin: "top left",
			background: checkerboard,
		};

		return (
			<div style={outerStyle}>
				<div style={scaledStyle}>
					<div style={innerStyle}>{children}</div>
				</div>
			</div>
		);
	}

	if (mode === "display") {
		// Display mode renders the DOM at literal buffer dimensions and visually
		// scales via CSS transform to fit the host container. Decoupling visual
		// size from layout size ensures: (1) snapdom captures use the buffer-sized
		// source DOM (so content with literal pixel widths matches the capture
		// dimensions), (2) generative components render at the correct pixel count
		// regardless of how the host container is sized, (3) pipeline children
		// rect measurements via offsetWidth/offsetHeight return buffer dims.
		// Same approach preview mode uses, without the workspace gutter.
		const scaleFactor = viewport.width === 0 || viewport.height === 0
			? 1
			: Math.min(viewport.width / width, viewport.height / height, 1);
		const outerStyle: CSSProperties = {
			width: width * scaleFactor,
			height: height * scaleFactor,
			position: "relative",
			overflow: "hidden",
			background: "transparent",
			flexShrink: 0,
		};
		const scaledStyle: CSSProperties = {
			...containerStyle,
			flexShrink: 0,
			transform: `scale(${String(scaleFactor)})`,
			transformOrigin: "top left",
			background: "transparent",
		};

		return (
			<div style={outerStyle}>
				<div style={scaledStyle}>
					<div style={innerStyle}>{children}</div>
				</div>
			</div>
		);
	}

	return (
		<div
			style={{
				...containerStyle,
				background: "transparent",
			}}
		>
			<div style={innerStyle}>{children}</div>
		</div>
	);
}
