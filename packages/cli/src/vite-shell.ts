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

// Leading NUL byte is the Vite convention marking a virtual module so other
// plugins leave it untouched.
const RESOLVED_ENTRY_ID = "\0virtual:pictel-entry";

// After tsup builds `src/` to `dist/`, this module lives at `dist/index.js`,
// so `../shell` reaches the shipped `packages/cli/shell` directory.
const SHELL_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "shell");

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

// Both `@vitejs/plugin-react` and its SWC variant name their plugins with a
// `vite:react` prefix.
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
  entryAbsPath: string;
  projectDir: string;
}

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

  const adoptedPlugins: Array<PluginOption> = userConfig.plugins
    ? [userConfig.plugins].flat(Infinity as 1)
    : [];

  const entryPlugin = pictelEntryPlugin(entryAbsPath);

  const plugins: Array<PluginOption> = hasReactPlugin(adoptedPlugins)
    ? [entryPlugin, ...adoptedPlugins]
    : [react(), entryPlugin, ...adoptedPlugins];

  return {
    root: SHELL_DIR,
    configFile: false,
    plugins,
    resolve: userConfig.resolve,
    css: userConfig.css,
    define: userConfig.define,
    optimizeDeps: userConfig.optimizeDeps,
    publicDir: userConfig.publicDir,
  };
}

interface BuildShellOptions {
  entryAbsPath: string;
  projectDir: string;
}

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
