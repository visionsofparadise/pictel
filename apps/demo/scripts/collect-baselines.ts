import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const demoDir = resolve(here, "..");
const baselinesPath = resolve(demoDir, "test-baselines.json");
const fallbackLogPath = resolve(demoDir, ".last-baseline-run.log");

function readStdin(): string {
	try {
		const chunk = readFileSync(0, "utf8");

		return chunk;
	} catch {
		return "";
	}
}

function loadLog(): string {
	const stdinContent = readStdin();

	if (stdinContent.length > 0) return stdinContent;

	if (!existsSync(fallbackLogPath)) {
		throw new Error(
			`collect-baselines: no input on stdin and no ${fallbackLogPath} file. ` +
				`Run \`npm run update:baselines\` first, or pipe a vitest log into this script.`,
		);
	}

	return readFileSync(fallbackLogPath, "utf8");
}

function parseBaselines(log: string): Record<string, Array<string>> {
	const harvested: Record<string, Array<string>> = {};
	const lineRegex = /PICTEL_BASELINE (\S+) (.+)$/gm;
	let match: RegExpExecArray | null;

	while ((match = lineRegex.exec(log)) !== null) {
		const slug = match[1]!;
		const rawJson = match[2]!.trim();
		let parsed: unknown;

		try {
			parsed = JSON.parse(rawJson);
		} catch {
			console.warn(`collect-baselines: skipping unparseable line for slug "${slug}": ${rawJson}`);
			continue;
		}

		if (!Array.isArray(parsed) || !parsed.every((entry) => typeof entry === "string")) {
			console.warn(`collect-baselines: skipping malformed entry for slug "${slug}": ${rawJson}`);
			continue;
		}

		harvested[slug] = parsed;
	}

	return harvested;
}

function loadExistingBaselines(): Record<string, Array<string>> {
	if (!existsSync(baselinesPath)) return {};

	const content = readFileSync(baselinesPath, "utf8");

	if (content.trim().length === 0) return {};

	return JSON.parse(content) as Record<string, Array<string>>;
}

function main(): void {
	const log = loadLog();
	const harvested = parseBaselines(log);
	const harvestedCount = Object.keys(harvested).length;

	if (harvestedCount === 0) {
		console.error(
			"collect-baselines: no PICTEL_BASELINE lines found in the run log. " +
				"Was PICTEL_UPDATE_BASELINES=1 set?",
		);
		process.exit(1);
	}

	const existing = loadExistingBaselines();
	const merged = { ...existing, ...harvested };
	const sortedKeys = Object.keys(merged).sort();
	const sortedMerged: Record<string, Array<string>> = {};

	for (const key of sortedKeys) sortedMerged[key] = merged[key]!;

	writeFileSync(baselinesPath, JSON.stringify(sortedMerged, null, 2) + "\n", "utf8");
	// eslint-disable-next-line no-console -- CLI success summary
	console.log(`collect-baselines: wrote ${String(harvestedCount)} baseline(s) to ${baselinesPath}`);
}

main();
