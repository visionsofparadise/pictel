import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadConfig } from "./config";

/**
 * `loadConfig` reads a real file through `jiti`, so each case writes a config
 * module to a temp directory and points `loadConfig` at it.
 */
describe("loadConfig", () => {
  let dir: string;

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), "pictel-config-test-"));
  });

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  /** Writes `source` to a uniquely-named module under the temp dir and returns its path. */
  async function writeConfig(name: string, source: string): Promise<string> {
    const path = join(dir, `${name}.ts`);
    await writeFile(path, source);

    return path;
  }

  it("loads a valid config's entries", async () => {
    const path = await writeConfig(
      "valid",
      `export default [
        { name: "instagram", canvas: "Instagram", width: 1080, height: 1080, format: "png" },
        { name: "banner", width: 1500, height: 500, format: "webp", quality: 90 },
      ];`,
    );

    const entries = await loadConfig(path);

    expect(entries).toHaveLength(2);
    expect(entries[0]?.name).toBe("instagram");
    expect(entries[1]?.format).toBe("webp");
  });

  it("rejects an empty array", async () => {
    const path = await writeConfig("empty", `export default [];`);

    await expect(loadConfig(path)).rejects.toThrow(/empty array/);
  });

  it("rejects an entry missing a name", async () => {
    const path = await writeConfig(
      "no-name",
      `export default [{ canvas: "Instagram", width: 1080, height: 1080 }];`,
    );

    await expect(loadConfig(path)).rejects.toThrow(/missing a string "name"/);
  });
});
