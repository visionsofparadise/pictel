import { type CSSProperties, type ComponentProps, Children, isValidElement } from "react";
import type { CanvasDimensions } from "../../context/canvas";
import { Sidebar } from "./Sidebar";
import type { SidebarItem } from "./SidebarRow";
import { tokens } from "../../tokens";
import { useMode } from "../../hooks/useMode";
import { useSearchParam } from "../../hooks/useSearchParam";
import type { Mode } from "../../hooks/useMode";
import { Canvas } from "../Canvas/Canvas";

interface ViewerProps extends ComponentProps<"div"> {
	mode?: Mode;
}

function formatDimensions(dimensions: CanvasDimensions | undefined): string {
	if (dimensions === undefined) return "—";

	return `${String(dimensions.width)}×${String(dimensions.height)}`;
}

const wrapperStyle: CSSProperties = {
	display: "flex",
	width: "100%",
	height: "100%",
	overflow: "hidden",
	backgroundColor: tokens.color.bg,
};

const mainStyle: CSSProperties = {
	flex: 1,
	height: "100%",
	overflow: "hidden",
	position: "relative",
};

/**
 * A development shell that hosts one or more `Canvas` children and provides a sidebar
 * for switching between them. The selected canvas is tracked in the URL via `?canvas=`.
 *
 * Use a Viewer when a project has multiple compositions you want to navigate during
 * development. In `display` and `render` modes the sidebar is hidden and only the
 * active Canvas is rendered, so the same component works for production embeds and
 * headless export.
 *
 * - `mode` — Overrides automatic mode detection for every child Canvas. `"preview"` shows the sidebar, `"display"` renders only the active Canvas bare, `"render"` is the same but intended for headless export. Defaults to the `?mode=` URL parameter, or `"preview"` if unset.
 *
 * @param props
 * @category Layout
 */
export function Viewer({ children, mode: modeProp, style, ...rest }: ViewerProps) {
	const selectedCanvas = useSearchParam("canvas", "");
	const urlMode = useMode();
	const mode = modeProp ?? urlMode;
	const isPreview = mode === "preview";

	const canvasElements: Array<{ element: React.ReactElement; name: string; dimensions: CanvasDimensions | undefined }> = [];

	let unnamedCount = 0;

	for (const child of Children.toArray(children)) {
		if (isValidElement(child) && child.type === Canvas) {
			const childProps = child.props as { name?: string; dimensions?: CanvasDimensions };
			const rawName = childProps.name;
			const name = rawName ?? `Canvas ${String((unnamedCount += 1))}`;

			canvasElements.push({ element: child, name, dimensions: childProps.dimensions });
		}
	}

	const matched = canvasElements.find((entry) => entry.name === selectedCanvas);
	const active = matched ?? canvasElements[0];

	if (!active) {
		return (
			<div
				style={style}
				{...rest}
			/>
		);
	}

	const handleSelect = (name: string) => {
		const nextUrl = new URL(window.location.href);

		nextUrl.searchParams.set("canvas", name);
		history.pushState({}, "", nextUrl);
		window.dispatchEvent(new PopStateEvent("popstate"));
	};

	if (!isPreview) {
		return (
			<div
				style={{ width: "100%", height: "100%", ...style }}
				{...rest}
			>
				{active.element}
			</div>
		);
	}

	const items: Array<SidebarItem> = canvasElements.map((entry) => ({
		name: entry.name,
		dimensions: formatDimensions(entry.dimensions),
	}));

	return (
		<div
			style={{ ...wrapperStyle, ...style }}
			{...rest}
		>
			<Sidebar
				items={items}
				activeName={active.name}
				onSelect={handleSelect}
			/>
			<div style={mainStyle}>{active.element}</div>
		</div>
	);
}
