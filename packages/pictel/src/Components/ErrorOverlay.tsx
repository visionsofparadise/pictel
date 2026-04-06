import { AlertTriangle } from "lucide-react";
import { type CSSProperties, useState } from "react";
import { useMode } from "../hooks/useMode";
import type { PipelineError } from "../pipeline/errors";

const containerStyle: CSSProperties = {
	position: "absolute",
	top: 8,
	left: 8,
	zIndex: 1000,
};

const buttonStyle: CSSProperties = {
	background: "none",
	border: "none",
	cursor: "pointer",
	padding: 4,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	borderRadius: 4,
	backgroundColor: "rgba(0, 0, 0, 0.6)",
};

const dropdownStyle: CSSProperties = {
	position: "absolute",
	top: "100%",
	left: 0,
	marginTop: 4,
	backgroundColor: "rgba(0, 0, 0, 0.85)",
	borderRadius: 6,
	padding: 8,
	minWidth: 280,
	maxHeight: 300,
	overflowY: "auto",
	color: "#fff",
	fontSize: 12,
	fontFamily: "monospace",
};

const errorItemStyle: CSSProperties = {
	padding: "6px 0",
	borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
};

const errorIdStyle: CSSProperties = {
	color: "#ff6b6b",
	fontWeight: 600,
	marginBottom: 2,
};

const errorMessageStyle: CSSProperties = {
	color: "#ccc",
	wordBreak: "break-word",
};

interface ErrorOverlayProps {
	errors: Array<PipelineError>;
}

export function ErrorOverlay({ errors }: ErrorOverlayProps) {
	const mode = useMode();

	const [open, setOpen] = useState(false);

	if (errors.length === 0) return null;

	if (mode !== "preview") return null;

	return (
		<div style={containerStyle}>
			<button
				type="button"
				style={buttonStyle}
				onClick={() => setOpen((prev) => !prev)}
				aria-label={`${errors.length} pipeline error${errors.length === 1 ? "" : "s"}`}
			>
				<AlertTriangle
					size={18}
					color="#ff4444"
				/>
			</button>
			{open && (
				<div style={dropdownStyle}>
					{errors.map((pipelineError) => (
						<div
							key={`${pipelineError.id}-${String(pipelineError.timestamp)}`}
							style={errorItemStyle}
						>
							<div style={errorIdStyle}>{pipelineError.id}</div>
							<div style={errorMessageStyle}>{pipelineError.error.message}</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
