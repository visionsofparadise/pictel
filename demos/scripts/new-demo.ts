/* eslint-disable no-console */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const demosRoot = resolve(here, "..");

const slug = process.argv[2];

if (slug === undefined || slug.length === 0) {
	console.error("usage: tsx demos/scripts/new-demo.ts <slug>");
	process.exit(1);
}

const kebabPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

if (!kebabPattern.test(slug)) {
	console.error(`slug "${slug}" is not kebab-case`);
	process.exit(1);
}

const folder = resolve(demosRoot, "src", slug);

if (existsSync(folder)) {
	console.error(`demos/src/${slug}/ already exists`);
	process.exit(1);
}

await mkdir(folder, { recursive: true });

const sourceTsx = `import { Canvas } from "pictel";

export default function Demo() {
	return (
		<Canvas mode="display" dimensions={{ width: 800, height: 600 }}>
			{/* TODO */}
		</Canvas>
	);
}
`;

const intentMd = `# ${slug}

<intent prose goes here>
`;

const today = new Date().toISOString().slice(0, 10);

const meta = {
	slug,
	title: "",
	sources: [],
	created: today,
	output: null,
};

await writeFile(resolve(folder, "source.tsx"), sourceTsx, "utf8");
await writeFile(resolve(folder, "intent.md"), intentMd, "utf8");
await writeFile(resolve(folder, "meta.json"), `${JSON.stringify(meta, null, "\t")}\n`, "utf8");

console.log(`Scaffolded demos/src/${slug}/`);
