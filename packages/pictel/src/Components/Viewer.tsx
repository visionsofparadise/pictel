import { type CSSProperties, type ComponentPropsWithoutRef, type ReactNode, Children, isValidElement } from "react";
import { useMode } from "../hooks/useMode";
import { useSearchParam } from "../hooks/useSearchParam";
import { Canvas } from "./Canvas";

interface ViewerProps extends ComponentPropsWithoutRef<"div"> {
	children?: ReactNode;
}

const panelStyle: CSSProperties = {
	width: 240,
	minWidth: 240,
	height: "100%",
	borderRight: "1px solid #e0e0e0",
	backgroundColor: "#fafafa",
	overflowY: "auto",
	padding: "8px 0",
};

const mainStyle: CSSProperties = {
	flex: 1,
	height: "100%",
	overflow: "hidden",
};

const baseItemStyle: CSSProperties = {
	padding: "8px 16px",
	cursor: "pointer",
	fontSize: 14,
	fontFamily: "system-ui, sans-serif",
	color: "#333",
};

const selectedItemStyle: CSSProperties = {
	...baseItemStyle,
	backgroundColor: "#e8e8e8",
	fontWeight: 600,
};

export function Viewer({ children, style, ...rest }: ViewerProps) {
	const selectedCanvas = useSearchParam("canvas", "");
	const mode = useMode();
	const isPreview = mode === "preview";

	const canvasElements: Array<{ element: React.ReactElement; name: string }> = [];

	let unnamedCount = 0;

	for (const child of Children.toArray(children)) {
		if (isValidElement(child) && child.type === Canvas) {
			const rawName = (child.props as { name?: string }).name;
			const name = rawName ?? `Canvas ${(unnamedCount += 1)}`;

			canvasElements.push({ element: child, name });
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

	return (
		<div
			style={{ display: "flex", width: "100%", height: "100%", overflow: "hidden", ...style }}
			{...rest}
		>
			<div style={panelStyle}>
				{canvasElements.map((entry) => (
					<div
						key={entry.name}
						style={entry.name === active.name ? selectedItemStyle : baseItemStyle}
						onClick={() => handleSelect(entry.name)}
					>
						{entry.name}
					</div>
				))}
			</div>
			<div style={mainStyle}>{active.element}</div>
		</div>
	);
}
