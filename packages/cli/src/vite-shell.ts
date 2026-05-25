import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import {
  build,
  loadConfigFromFile,
  preview,
  type InlineConfig,
  type Plugin,
  type PluginOption,
  type UserConfig,
} from "vite";

/** The id Vite resolves `virtual:pictel-entry` to internally. The leading
 * NUL byte is the Vite convention marking a virtual module so other plugins
 * leave it untouched. */
const RESOLVED_ENTRY_ID = "\0virtual:pictel-entry";

/** Absolute path to the installed shell directory (`packages/cli/shell`).
 * Resolved relative to this module so it works when `@pictel/cli` is installed
 * under a user's `node_modules`. After tsup builds `src/` to `dist/`, this
 * module lives at `dist/index.js`, so `../shell` reaches the shipped shell. */
const SHELL_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "shell");

/**
 * A Vite plugin exposing the user's composition entry module as the virtual
 * module `virtual:pictel-entry`, which the render shell's `entry.tsx` imports.
 *
 * @param entryAbsPath - Absolute path to the user's composition entry module.
 */
export function pictelEntryPlugin(entryAbsPath: string): Plugin {
  // POSIX-normalize the absolute path so the generated import specifier is a
  // valid module string on Windows (backslashes break Vite's import parsing).
  const posixPath = entryAbsPath.replace(/\\/g, "/");

  return {
    name: "pictel:virtual-entry",
    resolveId(id) {
      if (id === "virtual:pictel-entry") return RESOLVED_ENTRY_ID;

      return null;
    },
    load(id) {
      if (id === RESOLVED_ENTRY_ID) {
        return `export { default } from ${JSON.stringify(posixPath)};`;
      }

      return null;
    },
  };
}

/** Detect whether an adopted plugin set already contains a React plugin.
 * Both `@vitejs/plugin-react` and its SWC variant name their plugins with a
 * `vite:react` prefix. */
function hasReactPlugin(plugins: Array<PluginOption>): boolean {
  for (const plugin of plugins.flat(Infinity as 1)) {
    if (
      plugin &&
      typeof plugin === "object" &&
      "name" in plugin &&
      typeof plugin.name === "string" &&
      plugin.name.startsWith("vite:react")
    ) {
      return true;
    }
  }

  return false;
}

interface BuildViteConfigOptions {
  /** Absolute path to the user's composition entry module. */
  entryAbsPath: string;
  /** Already-resolved user project root (nearest `package.json` to `--entry`). */
  projectDir: string;
}

/**
 * Builds the CLI-owned Vite config for the render shell. Partially adopts the
 * user's `vite.config.*` if present — only the transform/resolve layer
 * (`plugins`, `resolve`, `css`, `define`, `optimizeDeps`, `publicDir`). The
 * app-shape layer (`root`, `build`, `server`, `base`, `appType`, HTML input)
 * is always pictel-owned.
 *
 * @param options - The entry path and resolved project directory.
 */
export async function buildViteConfig({
  entryAbsPath,
  projectDir,
}: BuildViteConfigOptions): Promise<InlineConfig> {
  // `loadConfigFromFile` with `configFile` omitted checks `projectDir` itself
  // for a `vite.config.*`; it does not walk ancestor directories.
  const loaded = await loadConfigFromFile(
    { command: "build", mode: "production" },
    undefined,
    projectDir,
  );

  const userConfig: UserConfig = loaded?.config ?? {};

  // Pick only the transform/resolve layer — never the app-shape layer.
  const adoptedPlugins: Array<PluginOption> = userConfig.plugins
    ? [userConfig.plugins].flat(Infinity as 1)
    : [];

  const entryPlugin = pictelEntryPlugin(entryAbsPath);

  // Compose: pictel's virtual-entry plugin + the adopted plugins. Prepend
  // pictel's own React plugin only when the adopted set has none.
  const plugins: Array<PluginOption> = hasReactPlugin(adoptedPlugins)
    ? [entryPlugin, ...adoptedPlugins]
    : [react(), entryPlugin, ...adoptedPlugins];

  return {
    // App-shape layer — pictel-owned.
    root: SHELL_DIR,
    configFile: false,
    plugins,
    // Transform/resolve layer — adopted from the user config when present.
    resolve: userConfig.resolve,
    css: userConfig.css,
    define: userConfig.define,
    optimizeDeps: userConfig.optimizeDeps,
    publicDir: userConfig.publicDir,
  };
}

interface BuildShellOptions {
  /** Absolute path to the user's composition entry module. */
  entryAbsPath: string;
  /** Already-resolved user project root. */
  projectDir: string;
}

/**
 * Does a one-time Vite production build of the render shell + the user's
 * composition entry into a fresh temp directory.
 *
 * @param options - The entry path and resolved project directory.
 */
export async function buildShell({
  entryAbsPath,
  projectDir,
}: BuildShellOptions): Promise<{ outDir: string }> {
  const outDir = await mkdtemp(join(tmpdir(), "pictel-shell-"));
  const config = await buildViteConfig({ entryAbsPath, projectDir });

  await build({
    ...config,
    build: {
      outDir,
      emptyOutDir: true,
    },
  });

  return { outDir };
}

/**
 * Serves an already-built shell output directory statically via Vite's
 * `preview` API. `preview` runs no HMR — consistent with build-once-serve-static.
 *
 * @param outDir - The build output directory produced by `buildShell`.
 */
export async function serveShell(
  outDir: string,
): Promise<{ url: string; close: () => Promise<void> }> {
  // Vite `preview` serves `<root>/<build.outDir>`. Set `root` to the parent
  // of the build output and `build.outDir` to its basename so the served
  // directory is exactly `outDir` without `root === outDir` overlap warnings.
  const server = await preview({
    configFile: false,
    root: dirname(outDir),
    build: { outDir: basename(outDir) },
    preview: { host: "127.0.0.1" },
  });

  const url = server.resolvedUrls?.local[0];

  if (url === undefined) {
    await new Promise<void>((resolve) => server.httpServer.close(() => resolve()));
    throw new Error("pictel: Vite preview server did not resolve a local URL");
  }

  return {
    url,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.httpServer.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      }),
  };
}
