import { useEffect, useState, type CSSProperties } from "react";
import { tokens } from "pictel";
import { ShowcasePage } from "./pages/ShowcasePage";
import { PreviewPage } from "./pages/PreviewPage";
import { DisplayPage } from "./pages/DisplayPage";

const PAGES = ["Showcase", "Preview", "Display"] as const;
type Page = (typeof PAGES)[number];

const PAGE_COMPONENTS: Record<Page, React.FC> = {
	Showcase: ShowcasePage,
	Preview: PreviewPage,
	Display: DisplayPage,
};

const FONT_OPTIONS = ["system", "tahoma", "arial", "helvetica", "georgia", "mono"] as const;
type FontKey = (typeof FONT_OPTIONS)[number];

const FONT_LABELS: Record<FontKey, string> = {
	system: "System",
	tahoma: "Tahoma",
	arial: "Arial",
	helvetica: "Helvetica",
	georgia: "Georgia",
	mono: "Mono",
};

const shellStyle: CSSProperties = {
	display: "flex",
	flexDirection: "column",
	width: "100vw",
	height: "100vh",
	backgroundColor: tokens.color.bg,
	color: tokens.color.text,
	fontFamily: tokens.font.ui,
	overflow: "hidden",
};

const tabBarStyle: CSSProperties = {
	display: "flex",
	flexShrink: 0,
	alignItems: "center",
	backgroundColor: tokens.color.panel,
	borderBottom: `1px solid ${tokens.color.border}`,
};

const fontSwitcherStyle: CSSProperties = {
	marginLeft: "auto",
	marginRight: tokens.space[3],
	backgroundColor: tokens.color.panel,
	color: tokens.color.text,
	border: `1px solid ${tokens.color.border}`,
	padding: `${String(tokens.space[1])}px ${String(tokens.space[2])}px`,
	fontSize: tokens.text.sm,
	fontFamily: tokens.font.ui,
	boxSizing: "border-box",
};

const buttonResetStyle: CSSProperties = {
	appearance: "none",
	background: "none",
	border: "none",
	margin: 0,
	font: "inherit",
	color: "inherit",
	cursor: "pointer",
};

const tabBaseStyle: CSSProperties = {
	...buttonResetStyle,
	padding: `${String(tokens.space[3])}px ${String(tokens.space[4])}px`,
	fontFamily: tokens.font.ui,
	fontSize: tokens.text.sm,
	color: tokens.color.text,
};

const mainStyle: CSSProperties = {
	flex: 1,
	minHeight: 0,
	position: "relative",
	overflow: "auto",
};

interface TabProps {
	label: Page;
	active: boolean;
	onSelect: (page: Page) => void;
}

function Tab({ label, active, onSelect }: TabProps) {
	const [hovered, setHovered] = useState(false);
	const background = active || hovered ? tokens.color.panelRaised : "transparent";
	const fontWeight = active ? 500 : 400;
	const style: CSSProperties = { ...tabBaseStyle, backgroundColor: background, fontWeight };

	return (
		<button
			type="button"
			style={style}
			onClick={() => onSelect(label)}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{label}
		</button>
	);
}

export function App() {
	const [activePage, setActivePage] = useState<Page>("Showcase");
	const [font, setFont] = useState<FontKey>("arial");
	const ActiveComponent = PAGE_COMPONENTS[activePage];

	useEffect(() => {
		document.documentElement.style.setProperty("--pictel-font-ui", tokens.fontOptions[font]);
	}, [font]);

	return (
		<div style={shellStyle}>
			<div style={tabBarStyle}>
				{PAGES.map((page) => (
					<Tab
						key={page}
						label={page}
						active={page === activePage}
						onSelect={setActivePage}
					/>
				))}
				<select
					style={fontSwitcherStyle}
					value={font}
					onChange={(event) => {
						setFont(event.target.value as FontKey);
					}}
				>
					{FONT_OPTIONS.map((key) => (
						<option key={key} value={key}>
							{FONT_LABELS[key]}
						</option>
					))}
				</select>
			</div>
			<main style={mainStyle}>
				<ActiveComponent />
			</main>
		</div>
	);
}
