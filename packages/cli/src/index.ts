/* eslint-disable no-console */
import { access } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, parse, resolve } from "node:path";
import { Command } from "commander";
import { type ExportEntry, loadConfig } from "./config";
import { encode, writeOutput } from "./encode";
import { launchBrowser, renderEntry } from "./render";
import { buildShell, serveShell } from "./vite-shell";

/** The default output format when an entry does not specify one. */
const DEFAULT_FORMAT = "png" as const;

/** The raw option values `commander` collects for the `render` command. */
interface RenderOptions {
  readonly entry: string;
  readonly config?: string;
  readonly canvas?: string;
  readonly props?: Record<string, unknown>;
  readonly width?: number;
  readonly height?: number;
  readonly format?: string;
  readonly out?: string;
  readonly scale?: number;
}

/**
 * Walks up from `startDir` looking for the nearest directory containing a
 * `package.json`. That directory is the user's project root — Vite's
 * transform/resolve layer and module resolution are anchored there.
 *
 * @param startDir - The directory to begin the search from.
 * @throws If no `package.json` is found before reaching the filesystem root.
 */
async function findProjectDir(startDir: string): Promise<string> {
  let current = startDir;

  for (;;) {
    try {
      await access(join(current, "package.json"));

      return current;
    } catch {
      const parent = dirname(current);

      if (parent === current) {
        throw new Error(
          `pictel: no package.json found walking up from ${startDir}`,
        );
      }

      current = parent;
    }
  }
}

/**
 * Resolves the list of export entries for a render run. With `--config`, the
 * config file's entries are used verbatim. Without it, a single entry is
 * synthesized from the CLI flags.
 *
 * @param entryAbsPath - The resolved absolute path to the composition entry.
 * @param options - The parsed CLI options.
 */
async function resolveEntries(
  entryAbsPath: string,
  options: RenderOptions,
): Promise<Array<ExportEntry>> {
  if (options.config !== undefined) {
    return loadConfig(resolve(options.config));
  }

  // Synthesize one entry. `name` falls back: --out basename → --canvas → entry filename.
  const name =
    options.out !== undefined
      ? parse(basename(options.out)).name
      : (options.canvas ?? parse(basename(entryAbsPath)).name);

  return [
    {
      name,
      canvas: options.canvas,
      props: options.props,
      width: options.width,
      height: options.height,
      format: isExportFormat(options.format) ? options.format : undefined,
      scale: options.scale,
    },
  ];
}

/** True when `value` is one of the four formats `ExportEntry` allows. */
function isExportFormat(value: string | undefined): value is ExportEntry["format"] {
  return (
    value === "png" || value === "jpeg" || value === "webp" || value === "avif"
  );
}

/**
 * Determines the output file path for an entry. Uses `--out` when given
 * (single-entry runs only), otherwise `<name>.<format>` in the current
 * working directory.
 *
 * @param entry - The export entry.
 * @param format - The resolved output format.
 * @param outFlag - The `--out` flag value, if any.
 */
function resolveOutputPath(
  entry: ExportEntry,
  format: ExportEntry["format"] & string,
  outFlag: string | undefined,
): string {
  if (outFlag !== undefined) {
    return isAbsolute(outFlag) ? outFlag : resolve(outFlag);
  }

  return resolve(`${entry.name}.${format}`);
}

/** The outcome of attempting to render a single entry. */
type EntryResult =
  | { readonly name: string; readonly outPath: string; readonly ok: true }
  | { readonly name: string; readonly ok: false; readonly error: string };

/**
 * Runs the full render batch: build the shell once, serve it, launch one
 * browser, then render → encode → write each entry. A per-entry failure is
 * caught and recorded — it fails that entry but does not abort the batch.
 *
 * @param options - The parsed CLI options.
 * @returns The per-entry results.
 */
async function runRender(options: RenderOptions): Promise<Array<EntryResult>> {
  const entryAbsPath = resolve(options.entry);
  const projectDir = await findProjectDir(dirname(entryAbsPath));
  const entries = await resolveEntries(entryAbsPath, options);

  const useOutFlag = options.config === undefined && entries.length === 1;

  const { outDir } = await buildShell({ entryAbsPath, projectDir });
  const server = await serveShell(outDir);
  const browser = await launchBrowser();

  const results: Array<EntryResult> = [];

  try {
    for (const entry of entries) {
      const format = entry.format ?? DEFAULT_FORMAT;

      try {
        const screenshot = await renderEntry({
          browser,
          baseUrl: server.url,
          canvas: entry.canvas,
          width: entry.width,
          height: entry.height,
          props: entry.props,
          scale: entry.scale,
        });

        const encoded = await encode(screenshot, format, entry.quality);
        const outPath = resolveOutputPath(entry, format, useOutFlag ? options.out : undefined);
        await writeOutput(encoded, outPath);

        results.push({ name: entry.name, outPath, ok: true });
      } catch (error) {
        results.push({ name: entry.name, ok: false, error: String(error) });
      }
    }
  } finally {
    // Settle both independently — a failing browser.close() must not skip the
    // server.close() and leak the preview server (or vice versa).
    await Promise.allSettled([browser.close(), server.close()]);
  }

  return results;
}

/** Prints a per-entry summary of a completed batch to the console. */
function printSummary(results: ReadonlyArray<EntryResult>): void {
  const failures = results.filter((result) => !result.ok);

  for (const result of results) {
    if (result.ok) {
      console.log(`  ok    ${result.name} -> ${result.outPath}`);
    } else {
      console.error(`  fail  ${result.name}: ${result.error}`);
    }
  }

  console.log(
    `\n${String(results.length - failures.length)}/${String(results.length)} entries rendered.`,
  );
}

const program = new Command();

program
  .name("pictel")
  .description("Headless image export for pictel compositions.");

program
  .command("render")
  .alias("export")
  .description("Render a pictel composition entry to one or more image files.")
  .requiredOption("--entry <path>", "path to the composition entry module")
  .option("--config <path>", "path to a pictel.exports.ts config file")
  .option("--canvas <name>", "name of the Canvas to render")
  .option(
    "--props <json>",
    "JSON-encoded props delivered to the composition",
    (value: string) => JSON.parse(value) as Record<string, unknown>,
  )
  .option("--width <px>", "output buffer width in pixels", Number)
  .option("--height <px>", "output buffer height in pixels", Number)
  .option("--format <fmt>", "output format: png, jpeg, webp, or avif")
  .option("--out <path>", "output file path (single-entry runs)")
  .option("--scale <n>", "device pixel-density multiplier", Number)
  .action(async (options: RenderOptions) => {
    const results = await runRender(options);
    printSummary(results);

    if (results.some((result) => !result.ok)) {
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(`pictel: ${String(error)}`);
  process.exitCode = 1;
});
