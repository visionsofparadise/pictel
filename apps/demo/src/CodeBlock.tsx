import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

export function CodeBlock({ source }: { source: string }) {
	const [html, setHtml] = useState("");

	useEffect(() => {
		void codeToHtml(source, {
			lang: "tsx",
			theme: "github-dark",
		}).then(setHtml);
	}, [source]);

	return (
		<div
			style={{
				borderRadius: 4,
				overflow: "auto",
				maxHeight: 400,
				fontSize: 13,
				lineHeight: 1.5,
				tabSize: 2,
			}}
			dangerouslySetInnerHTML={html ? { __html: html } : undefined}
		>
			{html ? undefined : (
				<pre
					style={{
						backgroundColor: "#1a1a1a",
						padding: 16,
						margin: 0,
						color: "#ccc",
						fontFamily: "monospace",
					}}
				>
					{source}
				</pre>
			)}
		</div>
	);
}
