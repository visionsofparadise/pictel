import puppeteer, { type Browser } from "puppeteer";

const PENDING_TIMEOUT_MS = 30_000;

// Puppeteer's default `--use-angle=swiftshader-webgl` blocks WebGPU adapter
// discovery — must be removed via ignoreDefaultArgs. `--enable-unsafe-webgpu`
// exposes a hardware adapter; the served shell is a localhost (secure-context)
// origin so `navigator.gpu` is present.
export function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({
    headless: true,
    ignoreDefaultArgs: ["--use-angle=swiftshader-webgl"],
    args: ["--no-sandbox", "--enable-unsafe-webgpu"],
  });
}

interface RenderEntryOptions {
  browser: Browser;
  baseUrl: string;
  canvas?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  props?: Record<string, unknown>;
  scale?: number;
}

export async function renderEntry({
  browser,
  baseUrl,
  canvas,
  canvasWidth,
  canvasHeight,
  props,
  scale,
}: RenderEntryOptions): Promise<Buffer> {
  const page = await browser.newPage();

  const pageErrors: Array<string> = [];
  const consoleMessages: Array<string> = [];

  page.on("pageerror", (error) => {
    pageErrors.push(String(error));
  });
  page.on("console", (message) => {
    consoleMessages.push(`[${message.type()}] ${message.text()}`);
  });

  try {
    const url = new URL(baseUrl);
    url.searchParams.set("mode", "render");

    if (canvas !== undefined) {
      url.searchParams.set("canvas", canvas);
    }

    if (canvasWidth !== undefined && canvasHeight !== undefined) {
      url.searchParams.set("canvasWidth", String(canvasWidth));
      url.searchParams.set("canvasHeight", String(canvasHeight));
    }

    if (props !== undefined) {
      url.searchParams.set("props", JSON.stringify(props));
    }

    await page.setViewport({
      width: canvasWidth ?? 1280,
      height: canvasHeight ?? 720,
      deviceScaleFactor: scale ?? 1,
    });

    await page.goto(url.toString(), { waitUntil: "load" });

    try {
      await page.waitForFunction(isPipelineSettled, { timeout: PENDING_TIMEOUT_MS });
    } catch {
      throw new Error(
        `Render timed out after ${PENDING_TIMEOUT_MS}ms waiting for [data-pictel-canvas][data-pictel-pending] to clear` +
          formatDiagnostics(pageErrors, consoleMessages),
      );
    }

    const errorAttribute = await page.evaluate(readErrorAttribute);

    if (typeof errorAttribute === "string") {
      throw new Error(
        `Composition reported pipeline errors: ${errorAttribute}` +
          formatDiagnostics(pageErrors, consoleMessages),
      );
    }

    const canvasElement = await page.$("[data-pictel-canvas]");

    if (canvasElement === null) {
      throw new Error(
        "Render shell contains no [data-pictel-canvas] element" +
          formatDiagnostics(pageErrors, consoleMessages),
      );
    }

    const screenshot = await canvasElement.screenshot({ omitBackground: true, type: "png" });

    return Buffer.from(screenshot);
  } finally {
    await page.close();
  }
}

// The render shell's `document` as seen inside a Puppeteer-evaluated callback.
// The package's tsconfig is Node-only (no DOM `lib`); the predicates below run
// in the browser via Puppeteer, never in Node.
declare const document: {
  querySelector(selectors: string): { getAttribute(name: string): string | null } | null;
};

function isPipelineSettled(): boolean {
  return document.querySelector("[data-pictel-canvas][data-pictel-pending]") === null;
}

function readErrorAttribute(): string | null {
  const root = document.querySelector("[data-pictel-canvas]");

  return root ? root.getAttribute("data-pictel-error") : null;
}

function formatDiagnostics(
  pageErrors: ReadonlyArray<string>,
  consoleMessages: ReadonlyArray<string>,
): string {
  const sections: Array<string> = [];

  if (pageErrors.length > 0) {
    sections.push(`page errors:\n  ${pageErrors.join("\n  ")}`);
  }

  if (consoleMessages.length > 0) {
    sections.push(`console output:\n  ${consoleMessages.join("\n  ")}`);
  }

  return sections.length > 0 ? `\n\n${sections.join("\n\n")}` : "";
}
