import { readFileSync, writeFileSync } from "fs";

const file = new URL("./README.md", import.meta.url);
let content = readFileSync(file, "utf8");

// Remove "()" from component headings: ### Blur() → ### Blur
content = content.replace(/^(###+ \w+)\(\)$/gm, "$1");

// Remove signature lines: > **Blur**(`props`): `Element`
content = content.replace(/^> \*\*\w+\*\*\(.*\).*`Element`\s*\n/gm, "");

// Remove #### Parameters sections (heading through end of table or next section)
content = content.replace(/^#### Parameters\n\n(?:\|.*\n)+\n?/gm, "");

// Remove #### Returns sections
content = content.replace(/^#### Returns\n\n`Element`\n\n?/gm, "");

// Remove #### Returns sections for Promise<Element>
content = content.replace(/^#### Returns\n\n`Promise`.*`Element`.*\n\n?/gm, "");

// Deduplicate: keep only the longest version of each ## section
const lines = content.split("\n");
const sections = [];
let current = null;

for (const line of lines) {
	if (/^## /.test(line)) {
		if (current) sections.push(current);
		current = { heading: line, content: "" };
	} else if (current) {
		current.content += line + "\n";
	} else {
		if (!sections.length && !current) {
			sections.push({ heading: null, content: line + "\n" });
		} else if (sections.length && sections[sections.length - 1].heading === null) {
			sections[sections.length - 1].content += line + "\n";
		}
	}
}
if (current) sections.push(current);

const seen = new Map();
const deduped = [];

for (const section of sections) {
	if (section.heading === null) {
		deduped.push(section);
		continue;
	}
	const existing = seen.get(section.heading);
	if (!existing) {
		seen.set(section.heading, section);
		deduped.push(section);
	} else if (section.content.length > existing.content.length) {
		const idx = deduped.indexOf(existing);
		deduped[idx] = section;
		seen.set(section.heading, section);
	}
}

content = deduped
	.map((s) => (s.heading ? s.heading + "\n" + s.content : s.content))
	.join("");

content = content.replace(/\n{3,}/g, "\n\n");
content = content.trimEnd() + "\n";

writeFileSync(file, content);
