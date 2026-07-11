import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface AssetEntry {
	filename: string;
	url: string;
	sha256: string;
	bytes: number;
}

interface Manifest {
	baseUrl: string;
	assets: Array<AssetEntry>;
}

const here = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(here, "..");
const manifestPath = resolve(packageDir, "integration-fixtures", "assets.manifest.json");
const assetsDir = resolve(packageDir, "integration-fixtures", "assets");

function sha256(bytes: Buffer): string {
	return createHash("sha256").update(bytes).digest("hex");
}

async function fetchAndVerify(entry: AssetEntry, destPath: string): Promise<void> {
	const response = await fetch(entry.url);

	if (!response.ok) {
		throw new Error(`fetch-assets: ${entry.filename} fetch failed with HTTP ${String(response.status)} from ${entry.url}`);
	}

	const bytes = Buffer.from(await response.arrayBuffer());
	const digest = sha256(bytes);

	if (digest !== entry.sha256) {
		throw new Error(
			`fetch-assets: ${entry.filename} hash mismatch after fetch. ` +
				`Manifest expects ${entry.sha256}, downloaded ${digest}. ` +
				`The remote asset changed or the manifest is stale — resolve before proceeding (frozen test inputs).`,
		);
	}

	if (bytes.length !== entry.bytes) {
		throw new Error(
			`fetch-assets: ${entry.filename} size mismatch. Manifest expects ${String(entry.bytes)} bytes, downloaded ${String(bytes.length)}.`,
		);
	}

	writeFileSync(destPath, bytes);
}

async function main(): Promise<void> {
	const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;

	mkdirSync(assetsDir, { recursive: true });

	let fetched = 0;
	let skipped = 0;

	for (const entry of manifest.assets) {
		const destPath = resolve(assetsDir, entry.filename);

		if (existsSync(destPath)) {
			const localDigest = sha256(readFileSync(destPath));

			if (localDigest === entry.sha256) {
				skipped += 1;
				continue;
			}

			console.warn(`fetch-assets: ${entry.filename} present but hash differs (local ${localDigest}); re-fetching.`);
		}

		await fetchAndVerify(entry, destPath);
		fetched += 1;
		// eslint-disable-next-line no-console -- CLI progress channel
		console.log(`fetch-assets: fetched ${entry.filename} (${String(entry.bytes)} bytes, verified)`);
	}

	// eslint-disable-next-line no-console -- CLI success summary
	console.log(`fetch-assets: ${String(manifest.assets.length)} asset(s) ready (${String(fetched)} fetched, ${String(skipped)} already present).`);
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
