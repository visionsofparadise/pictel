import { CodeBlock } from "./CodeBlock";

export interface Demo {
	slug: string;
	name: string;
	description: string;
	original?: string;
	component: () => React.ReactNode;
	source: string;
}

export function DemoView({ demo }: { demo: Demo }) {
	return (
		<div>
			<h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>{demo.name}</h2>
			<p style={{ fontSize: 14, color: "#888", marginBottom: 20, maxWidth: 700 }}>
				{demo.description}
			</p>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: demo.original
						? "minmax(0, 1fr) minmax(0, 1fr)"
						: "minmax(0, 1fr)",
					gap: 20,
					marginBottom: 20,
					alignItems: "start",
				}}
			>
				{demo.original ? (
					<div style={{ minWidth: 0 }}>
						<p style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
							Original
						</p>
						<img src={demo.original} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />
					</div>
				) : null}

				<div style={{ minWidth: 0 }}>
					<p style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
						After
					</p>
					<div style={{ borderRadius: 4, overflow: "hidden" }}>
						<demo.component />
					</div>
				</div>
			</div>

			<div>
				<p style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
					Code
				</p>
				<CodeBlock source={demo.source} />
			</div>
		</div>
	);
}
