import { CanvasContext, type CanvasContextValue } from "pictel";
import type { ReactNode } from "react";

/**
 * Minimal CanvasContext provider for showcase use. RenderStrip reads
 * `reportError` from CanvasContext; we supply a noop implementation plus the
 * other required fields so the chrome can render in isolation.
 */
export function ShowcaseCanvasContext({ children }: { children: ReactNode }) {
	const value: CanvasContextValue = {
		mode: "preview",
		dimensions: { width: 1080, height: 1080 },
		viewport: { width: 1080, height: 1080 },
		captureDimensions: { width: 1080, height: 1080 },
		reportError: () => {
			/* showcase noop */
		},
	};

	return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
}
