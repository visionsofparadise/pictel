import type { CSSProperties, ReactNode } from "react";
import { useCanvasContext } from "../context/canvas";
import { tokens } from "../tokens";

interface FrameProps {
	children?: ReactNode;
}

export function Frame({ children }: FrameProps) {
	const { mode, dimensions, viewport } = useCanvasContext();
	const { width, height } = dimensions;

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
		const workspacePad = tokens.space[16] * 2;
		const availW = Math.max(0, viewport.width - workspacePad);
		const availH = Math.max(0, viewport.height - workspacePad);
		const scaleFactor = availW === 0 || availH === 0 ? 1 : Math.min(availW / width, availH / height, 1);

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
