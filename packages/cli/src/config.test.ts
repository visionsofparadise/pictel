import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadConfig } from "./config";

describe("loadConfig", () => {
  let dir: string;

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), "pictel-config-test-"));
  });

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  async function writeConfig(name: string, source: string): Promise<string> {
    const path = join(dir, `${name}.ts`);
    await writeFile(path, source);

    return path;
  }

  it("loads a valid config's entries", async () => {
    const path = await writeConfig(
      "valid",
      `export default [
        { name: "instagram", canvas: "Instagram", canvasWidth: 1080, canvasHeight: 1080, format: "png" },
        { name: "banner", canvasWidth: 1500, canvasHeight: 500, format: "webp", quality: 90 },
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
      `export default [{ canvas: "Instagram", canvasWidth: 1080, canvasHeight: 1080 }];`,
    );

    await expect(loadConfig(path)).rejects.toThrow(/missing a string "name"/);
  });
});
