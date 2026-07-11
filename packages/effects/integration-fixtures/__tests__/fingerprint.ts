// eslint-disable-next-line import-x/extensions -- Vite's `?raw` query loads the file as a string at build time
import baselinesText from "../test-baselines.json?raw";
 
import gradientMapReferenceUrl from "../references/gradient-map.png";
import celShadeReferenceUrl from "../references/cel-shade.png";
import popArtReferenceUrl from "../references/pop-art.png";

type BaselineMap = Record<string, Array<string>>;

const baselines = JSON.parse(baselinesText) as BaselineMap;

const updateMode = (import.meta.env as Record<string, string | undefined>).PICTEL_UPDATE_BASELINES === "1";

const TOLERANCE_SLUGS = new Set(["gradient-map", "cel-shade", "pop-art"]);
const TOLERANCE_EPSILON = 8;
// Per-slug max count of pixels allowed to differ beyond epsilon. Sized per fixture:
// gradient-map is a smooth luminance→gradient map (cross-platform delta ~0). cel-shade and
// pop-art are Threshold+Outline quantization pipelines whose boundary pixels shift across
// GPU/OS render backends (cel-shade ~1067 px on linux), while any real regression restructures
// the whole image (cel-shade bands → 262k px, pop-art halftone → 305k px) — so a threshold in
// the wide gap between the cross-platform noise and the regression floor separates the two.
const TOLERANCE_THRESHOLDS: Record<string, number> = {
	"gradient-map": 500,
	"cel-shade": 5000,
	"pop-art": 8000,
};

const toleranceReferenceUrls: Record<string, string> = {
	"gradient-map": gradientMapReferenceUrl,
	"cel-shade": celShadeReferenceUrl,
	"pop-art": popArtReferenceUrl,
};

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

function getCanvasElements(container: HTMLElement): Array<HTMLCanvasElement> {
	const canvasRoots = Array.from(container.querySelectorAll<HTMLElement>("[data-pictel-canvas]"));

	if (canvasRoots.length === 0) {
		throw new Error("expectMatchesFingerprint: no [data-pictel-canvas] roots found in container");
	}

	return canvasRoots.map((canvasRoot) => getOuterCanvas(canvasRoot));
}

function readCanvas(canvas: HTMLCanvasElement): ImageData {
	const context = canvas.getContext("2d", { willReadFrequently: true });

	if (!context) throw new Error("expectMatchesFingerprint: canvas 2d context unavailable");

	return context.getImageData(0, 0, canvas.width, canvas.height);
}

async function computeFingerprints(container: HTMLElement): Promise<Array<string>> {
	const shas: Array<string> = [];

	for (const canvas of getCanvasElements(container)) {
		const image = readCanvas(canvas);
		const sha = await sha256Hex(image.data.buffer);
		shas.push(sha);
	}

	return shas;
}

async function loadReferenceImageData(url: string): Promise<ImageData> {
	const response = await fetch(url);
	const blob = await response.blob();
	const bitmap = await createImageBitmap(blob);
	const canvas = document.createElement("canvas");
	canvas.width = bitmap.width;
	canvas.height = bitmap.height;

	const context = canvas.getContext("2d", { willReadFrequently: true });

	if (!context) throw new Error("loadReferenceImageData: canvas 2d context unavailable");

	context.drawImage(bitmap, 0, 0);

	return context.getImageData(0, 0, bitmap.width, bitmap.height);
}

function countDifferingPixels(actual: ImageData, reference: ImageData, epsilon: number): number {
	const actualData = actual.data;
	const referenceData = reference.data;
	let differing = 0;

	for (let index = 0; index < actualData.length; index += 4) {
		if (
			Math.abs(actualData[index]! - referenceData[index]!) > epsilon ||
			Math.abs(actualData[index + 1]! - referenceData[index + 1]!) > epsilon ||
			Math.abs(actualData[index + 2]! - referenceData[index + 2]!) > epsilon ||
			Math.abs(actualData[index + 3]! - referenceData[index + 3]!) > epsilon
		) {
			differing += 1;
		}
	}

	return differing;
}

async function expectMatchesReference(container: HTMLElement, slug: string): Promise<void> {
	const canvases = getCanvasElements(container);

	if (canvases.length !== 1) {
		throw new Error(`expectMatchesReference: "${slug}" expects exactly one canvas, found ${String(canvases.length)}`);
	}

	const outer = canvases[0]!;

	if (updateMode) {
		const base64 = outer.toDataURL("image/png").split(",")[1]!;
		// eslint-disable-next-line no-console -- baseline-harvest channel (parsed by scripts/collect-baselines.ts)
		console.log(`PICTEL_BASELINE_IMAGE ${slug} ${base64}`);

		return;
	}

	const referenceUrl = toleranceReferenceUrls[slug];

	if (referenceUrl === undefined) throw new Error(`expectMatchesReference: no reference registered for "${slug}"`);

	const actual = readCanvas(outer);
	const reference = await loadReferenceImageData(referenceUrl);

	if (actual.width !== reference.width || actual.height !== reference.height) {
		throw new Error(
			`Reference dimension mismatch for "${slug}": actual ${String(actual.width)}x${String(actual.height)}, ` +
				`reference ${String(reference.width)}x${String(reference.height)}. To regenerate: ${REGENERATE_HINT}`,
		);
	}

	const differing = countDifferingPixels(actual, reference, TOLERANCE_EPSILON);
	const threshold = TOLERANCE_THRESHOLDS[slug] ?? 500;

	if (differing > threshold) {
		throw new Error(
			`Reference mismatch for "${slug}": ${String(differing)} pixel(s) differ beyond epsilon ${String(TOLERANCE_EPSILON)} ` +
				`(threshold ${String(threshold)}). ${CHROMIUM_VARIANCE_HINT} To regenerate: ${REGENERATE_HINT}`,
		);
	}
}

export async function expectMatchesFingerprint(container: HTMLElement, slug: string): Promise<void> {
	if (TOLERANCE_SLUGS.has(slug)) {
		await expectMatchesReference(container, slug);

		return;
	}

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
