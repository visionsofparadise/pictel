import { AlertTriangle } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { tokens } from "pictel";

export interface DemoError {
	id: string;
	message: string;
}

interface DemoErrorChipProps {
	errors: Array<DemoError>;
}

const containerStyle: CSSProperties = {
	position: "absolute",
	top: tokens.space[4],
	left: tokens.space[4],
	backgroundColor: tokens.color.errorBg,
	display: "flex",
	flexDirection: "column",
	minWidth: 120,
	maxWidth: 360,
	zIndex: 10,
};

const expandedListStyle: CSSProperties = {
	padding: tokens.space[2],
	maxHeight: 280,
	overflowY: "auto",
	display: "flex",
	flexDirection: "column",
	gap: tokens.space[2],
};

const errorIdStyle: CSSProperties = {
	fontSize: tokens.text.xs,
	color: tokens.color.error,
	fontWeight: 500,
	fontFamily: tokens.font.ui,
	letterSpacing: "0.02em",
};

const errorMessageStyle: CSSProperties = {
	fontSize: tokens.text.xs,
	color: tokens.color.textSecondary,
	fontFamily: tokens.font.ui,
	lineHeight: 1.4,
	wordBreak: "break-word",
	letterSpacing: "0.02em",
};

const errorRowStyle: CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: tokens.space[1],
};

const dividerStyle: CSSProperties = {
	borderBottom: `1px solid ${tokens.color.border}`,
};

const footerStyle: CSSProperties = {
	padding: `${String(tokens.space[1])}px ${String(tokens.space[2])}px`,
	display: "flex",
	gap: tokens.space[1],
	alignItems: "center",
};

const countTextStyle: CSSProperties = {
	fontSize: tokens.text.xs,
	color: tokens.color.error,
	fontFamily: tokens.font.ui,
	letterSpacing: "0.02em",
};

/**
 * Local recreation of the error chip for design iteration.
 * NOT used by pictel. Edit freely without rebuilding pictel.
 */
export function DemoErrorChip({ errors }: DemoErrorChipProps) {
	const [hovered, setHovered] = useState(false);

	if (errors.length === 0) return null;

	const countText = `${String(errors.length)} error${errors.length === 1 ? "" : "s"}`;

	return (
		<div
			style={containerStyle}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{hovered && (
				<>
					<div style={expandedListStyle}>
						{errors.map((demoError) => (
							<div
								key={demoError.id}
								style={errorRowStyle}
							>
								<span style={errorIdStyle}>{demoError.id}</span>
								<span style={errorMessageStyle}>{demoError.message}</span>
							</div>
						))}
					</div>
					<div style={dividerStyle} />
				</>
			)}
			<div style={footerStyle}>
				<AlertTriangle
					size={14}
					color={tokens.color.error}
				/>
				<span style={countTextStyle}>{countText}</span>
			</div>
		</div>
	);
}
