import { createJiti } from "jiti";

const FORMATS = ["png", "jpeg", "webp", "avif"] as const;

export interface ExportEntry {
  readonly name: string;
  readonly canvas?: string;
  readonly props?: Record<string, unknown>;
  readonly canvasWidth?: number;
  readonly canvasHeight?: number;
  readonly width?: number;
  readonly height?: number;
  readonly format?: "png" | "jpeg" | "webp" | "avif";
  readonly quality?: number;
  readonly scale?: number;
}

export function defineExports(entries: Array<ExportEntry>): Array<ExportEntry> {
  return entries;
}

function isValidFormat(value: unknown): value is ExportEntry["format"] {
  return typeof value === "string" && FORMATS.some((format) => format === value);
}

function validateDimension(
  value: unknown,
  field: string,
  location: string,
  entry: unknown,
): number | undefined {
  if (value === undefined) return undefined;

  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(
      `pictel: ${location} has an invalid "${field}" (expected a positive number): ${JSON.stringify(entry)}`,
    );
  }

  return value;
}

function validateEntry(entry: unknown, index: number, configPath: string): ExportEntry {
  const location = `${configPath} (entry ${String(index)})`;

  if (typeof entry !== "object" || entry === null) {
    throw new Error(`pictel: ${location} is not an object: ${JSON.stringify(entry)}`);
  }

  const candidate: Record<string, unknown> = { ...entry };

  if (typeof candidate.name !== "string" || candidate.name.length === 0) {
    throw new Error(`pictel: ${location} is missing a string "name": ${JSON.stringify(entry)}`);
  }

  if (candidate.format !== undefined && !isValidFormat(candidate.format)) {
    throw new Error(
      `pictel: ${location} has an invalid "format" (expected one of ${FORMATS.join(", ")}): ${JSON.stringify(entry)}`,
    );
  }

  return {
    name: candidate.name,
    canvas: typeof candidate.canvas === "string" ? candidate.canvas : undefined,
    props:
      typeof candidate.props === "object" && candidate.props !== null
        ? (candidate.props as Record<string, unknown>)
        : undefined,
    canvasWidth: validateDimension(candidate.canvasWidth, "canvasWidth", location, entry),
    canvasHeight: validateDimension(candidate.canvasHeight, "canvasHeight", location, entry),
    width: validateDimension(candidate.width, "width", location, entry),
    height: validateDimension(candidate.height, "height", location, entry),
    format: candidate.format,
    quality: typeof candidate.quality === "number" ? candidate.quality : undefined,
    scale: typeof candidate.scale === "number" ? candidate.scale : undefined,
  };
}

export async function loadConfig(configPath: string): Promise<Array<ExportEntry>> {
  const jiti = createJiti(import.meta.url);

  let loaded: unknown;

  try {
    loaded = await jiti.import(configPath, { default: true });
  } catch (error) {
    throw new Error(`pictel: failed to load config file ${configPath}: ${String(error)}`);
  }

  if (!Array.isArray(loaded)) {
    throw new Error(
      `pictel: config file ${configPath} must default-export an array of export entries`,
    );
  }

  if (loaded.length === 0) {
    throw new Error(`pictel: config file ${configPath} default-exports an empty array`);
  }

  return loaded.map((entry, index) => validateEntry(entry, index, configPath));
}
