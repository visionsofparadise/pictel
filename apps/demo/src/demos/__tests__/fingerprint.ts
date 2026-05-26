// eslint-disable-next-line import-x/extensions -- Vite's `?raw` query loads the file as a string at build time
import baselinesText from "../../../test-baselines.json?raw";

type BaselineMap = Record<string, Array<string>>;

const baselines = JSON.parse(baselinesText) as BaselineMap;

const updateMode = (import.meta.env as Record<string, string | undefined>).PICTEL_UPDATE_BASELINES === "1";

const REGENERATE_HINT =
	"PICTEL_UPDATE_BASELINES=1 npm run integration && npm run collect:baselines (or: npm run update:baselines)";

const CHROMIUM_VARIANCE_HINT =
	"Browser-decoder variance can shift a hash on Chromium bumps; regenerate via the command above and review the visual.";

function getOuterCanvas(root: HTMLElement): HTMLCanvasElement {
	const all = Array.from(root.querySelectorAll<HTMLCanvasElement>("canvas[data-pictel-raster]"));

	if (all.length === 0) throw new Error("no canvas[data-pictel-raster] found under root");

	return all[all.length - 1]!;
}

async function sha256Hex(bytes: ArrayBuffer): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", bytes);
	const view = new Uint8Array(digest);
	let hex = "";

	for (const byte of view) hex += byte.toString(16).padStart(2, "0");

	return hex;
}

async function computeFingerprints(container: HTMLElement): Promise<Array<string>> {
	const canvasRoots = Array.from(container.querySelectorAll<HTMLElement>("[data-pictel-canvas]"));

	if (canvasRoots.length === 0) {
		throw new Error("expectMatchesFingerprint: no [data-pictel-canvas] roots found in container");
	}

	const shas: Array<string> = [];

	for (const canvasRoot of canvasRoots) {
		const outer = getOuterCanvas(canvasRoot);
		const context = outer.getContext("2d", { willReadFrequently: true });

		if (!context) throw new Error("expectMatchesFingerprint: canvas 2d context unavailable");

		const image = context.getImageData(0, 0, outer.width, outer.height);
		const sha = await sha256Hex(image.data.buffer);
		shas.push(sha);
	}

	return shas;
}

export async function expectMatchesFingerprint(container: HTMLElement, slug: string): Promise<void> {
	const shas = await computeFingerprints(container);

	if (updateMode) {
		// eslint-disable-next-line no-console -- baseline-harvest channel (parsed by scripts/collect-baselines.ts)
		console.log(`PICTEL_BASELINE ${slug} ${JSON.stringify(shas)}`);

		return;
	}

	const baseline = baselines[slug];

	if (!baseline) {
		throw new Error(
			`No baseline for "${slug}". Computed: ${JSON.stringify(shas)}. ` +
				`To create: ${REGENERATE_HINT}`,
		);
	}

	if (baseline.length !== shas.length) {
		throw new Error(
			`Fingerprint count mismatch for "${slug}": baseline has ${String(baseline.length)} entries, ` +
				`computed ${String(shas.length)}. Baseline: ${JSON.stringify(baseline)}; ` +
				`computed: ${JSON.stringify(shas)}. To regenerate: ${REGENERATE_HINT}`,
		);
	}

	for (let index = 0; index < baseline.length; index += 1) {
		const expected = baseline[index]!;
		const actual = shas[index]!;

		if (expected !== actual) {
			throw new Error(
				`Fingerprint mismatch for "${slug}" canvas[${String(index)}]: ` +
					`expected ${expected}, got ${actual}. ${CHROMIUM_VARIANCE_HINT} ` +
					`To regenerate: ${REGENERATE_HINT}`,
			);
		}
	}
}
