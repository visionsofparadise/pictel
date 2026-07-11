import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Browser, Page } from "puppeteer";
import sharp from "sharp";
import { launchBrowser, renderEntry } from "./render";
import { buildShell, serveShell } from "./vite-shell";

const here = dirname(fileURLToPath(import.meta.url));
const entryAbsPath = join(here, "render-fixture", "entry.tsx");
const projectDir = dirname(here);

const FIXTURE_WIDTH = 240;
const FIXTURE_HEIGHT = 160;

test("renders the fixture composition end-to-end to a decodable, non-blank PNG", async () => {
  const { outDir } = await buildShell({ entryAbsPath, projectDir });
  const server = await serveShell(outDir);
  let browser: Browser | undefined;
  let page: Page | undefined;

  try {
    browser = await launchBrowser();
    page = await browser.newPage();

    const screenshot = await renderEntry({ page, baseUrl: server.url });

    const image = sharp(screenshot);
    const metadata = await image.metadata();

    expect(metadata.format).toBe("png");
    expect(metadata.width).toBe(FIXTURE_WIDTH);
    expect(metadata.height).toBe(FIXTURE_HEIGHT);

    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    const { channels } = info;

    const samples: Array<string> = [];
    let opaqueColoredCount = 0;

    for (let sy = 0; sy < 5; sy++) {
      for (let sx = 0; sx < 5; sx++) {
        const x = Math.floor(((sx + 0.5) / 5) * info.width);
        const y = Math.floor(((sy + 0.5) / 5) * info.height);
        const offset = (y * info.width + x) * channels;
        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        const alpha = channels >= 4 ? data[offset + 3] : 255;

        samples.push(`${String(red)},${String(green)},${String(blue)},${String(alpha)}`);

        if (alpha === 255 && red + green + blue > 0) {
          opaqueColoredCount++;
        }
      }
    }

    expect(opaqueColoredCount).toBeGreaterThan(0);
    expect(new Set(samples).size).toBeGreaterThan(1);
  } finally {
    await Promise.allSettled([
      page?.close(),
      browser?.close(),
      server.close(),
    ]);
  }
});
