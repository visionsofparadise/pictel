import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = resolve(here, "../../..");
const entry = resolve(repoRoot, "apps/demo/src/readme/entry.tsx");
const config = resolve(repoRoot, "apps/demo/pictel.readme.exports.ts");
const outDir = resolve(repoRoot, "packages/pictel/README-images");
const cliEntry = resolve(repoRoot, "packages/cli/dist/index.js");

const buildResult = spawnSync(
	"npm",
	["--workspace=@pictel/cli", "run", "build"],
	{ cwd: repoRoot, stdio: "inherit", shell: true },
);

if (buildResult.status !== 0) {
	process.exit(buildResult.status ?? 1);
}

const result = spawnSync(
	process.execPath,
	[cliEntry, "render", "--entry", entry, "--config", config],
	{ cwd: outDir, stdio: "inherit" },
);

process.exit(result.status ?? 1);
