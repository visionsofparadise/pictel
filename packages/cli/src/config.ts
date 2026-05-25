import { createJiti } from "jiti";

/** The image output formats Sharp encodes to (see `encode.ts`). */
const FORMATS = ["png", "jpeg", "webp", "avif"] as const;

/**
 * A single export entry — one rendered image. The shape of each element of a
 * `pictel.exports.ts` config's default export. `name` is the only required
 * field; everything else falls back to the composition's authored Canvas
 * `dimensions` and the CLI defaults.
 */
export interface ExportEntry {
  /** Output base name. Used for the default output path (`<name>.<format>`). */
  readonly name: string;
  /** Display name of the Canvas to render — selects which Canvas a Viewer shows. */
  readonly canvas?: string;
  /** Props delivered to the composition via `useProps()`. */
  readonly props?: Record<string, unknown>;
  /** Output buffer width in CSS pixels. Overrides the Canvas `dimensions`. */
  readonly width?: number;
  /** Output buffer height in CSS pixels. Overrides the Canvas `dimensions`. */
  readonly height?: number;
  /** Output image format. Defaults to `"png"`. */
  readonly format?: "png" | "jpeg" | "webp" | "avif";
  /** Encoding quality (1–100). Ignored for `png`. */
  readonly quality?: number;
  /** Device pixel-density multiplier (Puppeteer `deviceScaleFactor`). */
  readonly scale?: number;
}

/**
 * Identity helper for authoring a type-safe `pictel.exports.ts`. The user wraps
 * their export array in `defineExports([...])` to get autocompletion and type
 * checking against {@link ExportEntry} without an explicit annotation.
 *
 * @param entries - The export entries.
 */
export function defineExports(entries: Array<ExportEntry>): Array<ExportEntry> {
  return entries;
}

/** True when `value` is one of the allowed {@link ExportEntry} formats. */
function isValidFormat(value: unknown): value is ExportEntry["format"] {
  return (
    typeof value === "string" &&
    FORMATS.some((format) => format === value)
  );
}

/**
 * Validates an optional `width`/`height` field is a finite positive number,
 * returning it (or `undefined` when absent) and throwing otherwise.
 *
 * @param value - The candidate dimension value.
 * @param field - The field name, for the error message.
 * @param location - The config-file/entry location, for the error message.
 * @param entry - The offending entry, for the error message.
 */
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

/**
 * Validates a single value loaded from a config file is a well-formed
 * {@link ExportEntry}, throwing with the file path and offending entry on
 * failure. Returns a freshly-constructed entry — only the recognized fields
 * are carried through.
 *
 * @param entry - The candidate entry.
 * @param index - The entry's position in the config array, for the error message.
 * @param configPath - The config file path, for the error message.
 */
function validateEntry(entry: unknown, index: number, configPath: string): ExportEntry {
  const location = `${configPath} (entry ${String(index)})`;

  if (typeof entry !== "object" || entry === null) {
    throw new Error(`pictel: ${location} is not an object: ${JSON.stringify(entry)}`);
  }

  const candidate: Record<string, unknown> = { ...entry };

  if (typeof candidate.name !== "string" || candidate.name.length === 0) {
    throw new Error(
      `pictel: ${location} is missing a string "name": ${JSON.stringify(entry)}`,
    );
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
    width: validateDimension(candidate.width, "width", location, entry),
    height: validateDimension(candidate.height, "height", location, entry),
    format: candidate.format,
    quality: typeof candidate.quality === "number" ? candidate.quality : undefined,
    scale: typeof candidate.scale === "number" ? candidate.scale : undefined,
  };
}

/**
 * Loads and validates a `pictel.exports.ts` config file. The file is loaded
 * with `jiti` (so it may be authored in TypeScript), and its default export
 * must be a non-empty array of {@link ExportEntry}.
 *
 * @param configPath - Absolute or cwd-relative path to the config file.
 * @throws If the file's default export is not a non-empty array, or any entry
 *   is malformed.
 */
export async function loadConfig(configPath: string): Promise<Array<ExportEntry>> {
  const jiti = createJiti(import.meta.url);

  let loaded: unknown;

  try {
    loaded = await jiti.import(configPath, { default: true });
  } catch (error) {
    throw new Error(
      `pictel: failed to load config file ${configPath}: ${String(error)}`,
    );
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
