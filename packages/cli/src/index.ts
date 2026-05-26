/* eslint-disable no-console */
import { access } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, parse, resolve } from "node:path";
import { Command } from "commander";
import { type ExportEntry, loadConfig } from "./config";
import { encode, writeOutput } from "./encode";
import { launchBrowser, renderEntry } from "./render";
import { buildShell, serveShell } from "./vite-shell";

const DEFAULT_FORMAT = "png" as const;

interface RenderOptions {
  readonly entry: string;
  readonly config?: string;
  readonly canvas?: string;
  readonly props?: Record<string, unknown>;
  readonly canvasWidth?: number;
  readonly canvasHeight?: number;
  readonly width?: number;
  readonly height?: number;
  readonly format?: string;
  readonly out?: string;
  readonly scale?: number;
}

async function findProjectDir(startDir: string): Promise<string> {
  let current = startDir;

  for (;;) {
    try {
      await access(join(current, "package.json"));

      return current;
    } catch {
      const parent = dirname(current);

      if (parent === current) {
        throw new Error(`pictel: no package.json found walking up from ${startDir}`);
      }

      current = parent;
    }
  }
}

async function resolveEntries(
  entryAbsPath: string,
  options: RenderOptions,
): Promise<Array<ExportEntry>> {
  if (options.config !== undefined) {
    return loadConfig(resolve(options.config));
  }

  const name =
    options.out !== undefined
      ? parse(basename(options.out)).name
      : (options.canvas ?? parse(basename(entryAbsPath)).name);

  return [
    {
      name,
      canvas: options.canvas,
      props: options.props,
      canvasWidth: options.canvasWidth,
      canvasHeight: options.canvasHeight,
      width: options.width,
      height: options.height,
      format: isExportFormat(options.format) ? options.format : undefined,
      scale: options.scale,
    },
  ];
}

function isExportFormat(value: string | undefined): value is ExportEntry["format"] {
  return value === "png" || value === "jpeg" || value === "webp" || value === "avif";
}

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

type EntryResult =
  | { readonly name: string; readonly outPath: string; readonly ok: true }
  | { readonly name: string; readonly ok: false; readonly error: string };

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
          canvasWidth: entry.canvasWidth,
          canvasHeight: entry.canvasHeight,
          props: entry.props,
          scale: entry.scale,
        });

        const encoded = await encode(screenshot, {
          format,
          quality: entry.quality,
          width: entry.width,
          height: entry.height,
        });
        const outPath = resolveOutputPath(entry, format, useOutFlag ? options.out : undefined);
        await writeOutput(encoded, outPath);

        results.push({ name: entry.name, outPath, ok: true });
      } catch (error) {
        results.push({ name: entry.name, ok: false, error: String(error) });
      }
    }
  } finally {
    await Promise.allSettled([browser.close(), server.close()]);
  }

  return results;
}

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

program.name("pictel").description("Headless image export for pictel compositions.");

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
  .option("--canvas-width <px>", "canvas buffer width override in pixels", Number)
  .option("--canvas-height <px>", "canvas buffer height override in pixels", Number)
  .option("--width <px>", "output image width in pixels (Sharp resize)", Number)
  .option("--height <px>", "output image height in pixels (Sharp resize)", Number)
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
