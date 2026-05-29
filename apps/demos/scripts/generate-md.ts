/* eslint-disable no-console */
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const demosRoot = resolve(here, "..");

const slug = process.argv[2];

if (slug === undefined || slug.length === 0) {
	console.error("usage: tsx demos/scripts/generate-md.ts <slug>");
	process.exit(1);
}

const folder = resolve(demosRoot, "src", slug);

if (!existsSync(folder)) {
	console.error(`demos/src/${slug}/ does not exist`);
	process.exit(1);
}

const sourceTsx = await readFile(resolve(folder, "source.tsx"), "utf8");
const intentMd = await readFile(resolve(folder, "intent.md"), "utf8");
const metaRaw = await readFile(resolve(folder, "meta.json"), "utf8");
const sourcesRaw = await readFile(resolve(demosRoot, "sources.json"), "utf8");

interface Meta {
	readonly slug: string;
	readonly title: string;
	readonly sources: ReadonlyArray<string>;
	readonly created: string;
	readonly output: string | null;
}

interface SourceEntry {
	readonly s3: string;
}

const meta = JSON.parse(metaRaw) as Meta;
const sources = JSON.parse(sourcesRaw) as Record<string, SourceEntry>;

if (meta.output === null) {
	console.error(`${slug} has no rendered output — run render-demo first`);
	process.exit(1);
}

const intentBody = intentMd.replace(/^#\s+.*\n+/, "").trimEnd();

let beforeAfter: string;

if (meta.sources.length === 0) {
	beforeAfter = `![](${meta.output})`;
} else {
	const primarySlug = meta.sources[0];
	const primary = sources[primarySlug];

	if (primary === undefined) {
		console.error(`source slug "${primarySlug}" not found in demos/sources.json`);
		process.exit(1);
	}

	beforeAfter = `**Before**\n\n![](${primary.s3})\n\n**After**\n\n![](${meta.output})`;
}

const out = `# ${meta.title}

${intentBody}

${beforeAfter}

\`\`\`tsx
${sourceTsx.trimEnd()}
\`\`\`
`;

const outPath = resolve(demosRoot, "out", `${slug}.md`);
await writeFile(outPath, out, "utf8");

console.log(outPath);
