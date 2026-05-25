import puppeteer, { type Browser } from "puppeteer";

/**
 * Timeout (ms) for the render-mode ready signal — the disappearance of
 * `[data-pictel-canvas][data-pictel-pending]`. Mirrors `PENDING_TIMEOUT_MS`
 * in pictel's in-browser export utility
 * (`packages/pictel/src/design-system/export.ts`) so the CLI and the iframe
 * export path wait for the same duration.
 */
const PENDING_TIMEOUT_MS = 30_000;

/**
 * Launches a headless Chromium instance configured for WebGPU. The flag set
 * was empirically validated in Phase 0 of the CLI renderer plan: Puppeteer's
 * default `--use-angle=swiftshader-webgl` suppresses adapter discovery and must
 * be removed via `ignoreDefaultArgs`; `--enable-unsafe-webgpu` then exposes a
 * hardware adapter headless. The served shell is an `http://localhost` /
 * `http://127.0.0.1` origin — a secure context — so `navigator.gpu` is present.
 */
export function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({
    headless: true,
    ignoreDefaultArgs: ["--use-angle=swiftshader-webgl"],
    args: ["--no-sandbox", "--enable-unsafe-webgpu"],
  });
}

interface RenderEntryOptions {
  /** A launched browser owned by the caller — reused across the whole batch. */
  browser: Browser;
  /** The served render-shell URL (from `serveShell`). */
  baseUrl: string;
  /** Display name of the Canvas to render. Selects which Canvas a Viewer shows. */
  canvas?: string;
  /** Output buffer width in CSS pixels. Used only when both width and height are given. */
  width?: number;
  /** Output buffer height in CSS pixels. Used only when both width and height are given. */
  height?: number;
  /** Props delivered to the composition via `useProps()`. JSON-encoded into the URL. */
  props?: Record<string, unknown>;
  /** Device pixel-density multiplier (Puppeteer `deviceScaleFactor`). */
  scale?: number;
}

/**
 * Renders a single composition entry to a raw PNG screenshot buffer. Opens a
 * fresh page (clean module and ML state per entry), navigates the served shell
 * in render mode through the URL query-param contract, waits for the
 * `[data-pictel-canvas][data-pictel-pending]` ready signal to clear, checks
 * the `data-pictel-error` render-mode error signal, and element-screenshots
 * the `[data-pictel-canvas]` root. The screenshot is the bare composition at
 * its rendered size — encoding is the caller's responsibility (see
 * `encode.ts`).
 *
 * @param options - The browser, served URL, and the entry's render parameters.
 * @throws If the pipeline does not settle within {@link PENDING_TIMEOUT_MS}, if
 *   the composition reports pipeline errors, or if the canvas root is missing.
 */
export async function renderEntry({
  browser,
  baseUrl,
  canvas,
  width,
  height,
  props,
  scale,
}: RenderEntryOptions): Promise<Buffer> {
  const page = await browser.newPage();

  // Diagnostic collectors — surfaced in the error message on a render failure.
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

    if (width !== undefined && height !== undefined) {
      url.searchParams.set("width", String(width));
      url.searchParams.set("height", String(height));
    }

    if (props !== undefined) {
      url.searchParams.set("props", JSON.stringify(props));
    }

    await page.setViewport({
      width: width ?? 1280,
      height: height ?? 720,
      deviceScaleFactor: scale ?? 1,
    });

    await page.goto(url.toString(), { waitUntil: "load" });

    try {
      await page.waitForFunction(isPipelineSettled, {
        timeout: PENDING_TIMEOUT_MS,
      });
    } catch {
      throw new Error(
        `Render timed out after ${PENDING_TIMEOUT_MS}ms waiting for [data-pictel-canvas][data-pictel-pending] to clear` +
          formatDiagnostics(pageErrors, consoleMessages),
      );
    }

    // `data-pictel-error` on the canvas root carries a JSON array of
    // `{ id, message }` when the composition reported pipeline errors, and is
    // absent (→ null) otherwise. Read it after the ready signal clears.
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

    const screenshot = await canvasElement.screenshot({
      omitBackground: true,
      type: "png",
    });

    return Buffer.from(screenshot);
  } finally {
    await page.close();
  }
}

/**
 * The render shell's `document`, as seen inside a Puppeteer-evaluated callback.
 * The package's `src/` tsconfig is Node-only (no DOM `lib`), so the minimal
 * surface the browser-context predicates below touch is declared locally
 * rather than pulling the whole DOM library into a Node build. These functions
 * are serialized and run in the browser by Puppeteer — never in Node.
 */
declare const document: {
  querySelector(selectors: string): { getAttribute(name: string): string | null } | null;
};

/**
 * Browser-context predicate: true once the single Canvas-root
 * `[data-pictel-canvas][data-pictel-pending]` element is no longer present —
 * the render-mode ready signal derived from the per-Canvas pending registry.
 * Passed to `page.waitForFunction`.
 */
function isPipelineSettled(): boolean {
  return document.querySelector("[data-pictel-canvas][data-pictel-pending]") === null;
}

/**
 * Browser-context evaluation: returns the `[data-pictel-canvas]` root's
 * `data-pictel-error` attribute (a JSON `{ id, message }[]`), or `null` when
 * the composition reported no pipeline errors. Passed to `page.evaluate`.
 */
function readErrorAttribute(): string | null {
  const root = document.querySelector("[data-pictel-canvas]");

  return root ? root.getAttribute("data-pictel-error") : null;
}

/** Appends collected page/console diagnostics to a failure message, or nothing if there are none. */
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
