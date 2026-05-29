/* eslint-disable no-console */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const demosRoot = resolve(here, "..");
const repoRoot = resolve(demosRoot, "..", "..");

const slug = process.argv[2];

if (slug === undefined || slug.length === 0) {
	console.error("usage: tsx demos/scripts/render-demo.ts <slug>");
	process.exit(1);
}

const folder = resolve(demosRoot, "src", slug);
const sourcePath = resolve(folder, "source.tsx");

if (!existsSync(sourcePath)) {
	console.error(`demos/src/${slug}/source.tsx does not exist`);
	process.exit(1);
}

const cacheDir = resolve(demosRoot, ".cache");
await mkdir(cacheDir, { recursive: true });
const outPath = resolve(cacheDir, `${slug}.png`);

const cliEntry = resolve(repoRoot, "packages/cli/dist/index.js");

if (!existsSync(cliEntry)) {
	console.error("packages/cli/dist/index.js missing — run `npm --workspace=@pictel/cli run build` first");
	process.exit(1);
}

const renderResult = spawnSync(
	process.execPath,
	[cliEntry, "render", "--entry", sourcePath, "--out", outPath],
	{ stdio: "inherit" },
);

if (renderResult.status !== 0) {
	process.exit(renderResult.status ?? 1);
}

const s3Key = `outputs/${slug}.png`;
const s3Uri = `s3://pictel-demos/${s3Key}`;
const publicUrl = `https://pictel-demos.s3.us-east-1.amazonaws.com/${s3Key}`;

const uploadResult = spawnSync(
	"aws",
	["--profile", "personal", "s3", "cp", outPath, s3Uri],
	{ stdio: "inherit", shell: true },
);

if (uploadResult.status !== 0) {
	process.exit(uploadResult.status ?? 1);
}

const metaPath = resolve(folder, "meta.json");
const metaRaw = await readFile(metaPath, "utf8");
const meta = JSON.parse(metaRaw) as Record<string, unknown>;
meta.output = publicUrl;
await writeFile(metaPath, `${JSON.stringify(meta, null, "\t")}\n`, "utf8");

console.log(publicUrl);
