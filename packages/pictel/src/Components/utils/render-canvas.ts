import { createRoot, type Root } from "react-dom/client";
import type { ReactElement } from "react";

export interface RenderResult {
	container: HTMLElement;
	root: Root;
	cleanup: () => void;
}

export function renderCanvas(jsx: ReactElement): RenderResult {
	const container = document.createElement("div");
	container.style.position = "relative";
	container.style.width = "400px";
	container.style.height = "400px";
	document.body.appendChild(container);
	const root = createRoot(container);
	root.render(jsx);

	return {
		container,
		root,
		cleanup: () => {
			root.unmount();
			container.remove();
		},
	};
}
