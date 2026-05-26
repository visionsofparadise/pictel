import { type CSSProperties, type ComponentProps, Children, isValidElement } from "react";
import type { CanvasDimensions } from "../context/canvas";
import { Sidebar } from "../design-system/Sidebar";
import type { SidebarItem } from "../design-system/SidebarRow";
import { tokens } from "../design-system/tokens";
import { useMode } from "../hooks/useMode";
import { useSearchParam } from "../hooks/useSearchParam";
import type { Mode } from "../Mode";
import { Canvas } from "./Canvas";

interface ViewerProps extends ComponentProps<"div"> {
	/** Overrides URL-based mode detection for all child canvases. One of `"preview"`, `"display"`, or `"render"`. */
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
 * Development preview shell that renders one or more Canvas components.
 * Provides a sidebar for selecting between canvases when multiple are present.
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
