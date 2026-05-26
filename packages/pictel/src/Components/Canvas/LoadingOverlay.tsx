import type { CSSProperties } from "react";
import { tokens } from "../../tokens";

interface LoadingOverlayProps {
	pending: boolean;
}

const darkenStyle: CSSProperties = {
	position: "absolute",
	inset: 0,
	backgroundColor: tokens.color.loadingOverlay,
	pointerEvents: "none",
	zIndex: 9,
};

const spinnerContainerStyle: CSSProperties = {
	position: "absolute",
	bottom: tokens.space[4],
	right: tokens.space[4],
	pointerEvents: "none",
	zIndex: 10,
};

export function LoadingOverlay({ pending }: LoadingOverlayProps) {
	if (!pending) return null;

	return (
		<>
			<div style={darkenStyle} />
			<div style={spinnerContainerStyle}>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke={tokens.color.text}
					strokeWidth="2.5"
					strokeLinecap="round"
				>
					<path d="M12 2a10 10 0 0 1 10 10">
						<animateTransform
							attributeName="transform"
							type="rotate"
							from="0 12 12"
							to="360 12 12"
							dur="0.8s"
							repeatCount="indefinite"
						/>
					</path>
				</svg>
			</div>
		</>
	);
}
