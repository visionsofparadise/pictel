import { createRoot, type Root } from "react-dom/client";
import type { ReactElement } from "react";

export interface RenderResult {
    container: HTMLElement;
    root: Root;
    cleanup: () => void;
}

/**
 * Mount a JSX tree into a fresh detached container and return cleanup handles.
 * Caller is responsible for calling cleanup() in afterEach.
 */
export function renderCanvas(jsx: ReactElement): RenderResult {
    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.width = "400px";
    container.style.height = "400px";
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(jsx);

    return {
        container,
        root,
        cleanup: () => {
            root.unmount();
            container.remove();
        },
    };
}

/**
 * Poll until no element with [data-pictel-pending] exists in the container,
 * using requestAnimationFrame between checks. Rejects after timeout with a
 * diagnostic listing which pipelines are still pending. Waits a minimum of
 * two animation frames so React's initial commit has a chance to land before
 * the first "no pending" resolution.
 */
export function waitForPipeline(
    container: HTMLElement,
    options: { timeout?: number } = {},
): Promise<void> {
    const timeout = options.timeout ?? 10000;

    return new Promise((resolve, reject) => {
        const start = performance.now();
        let framesWaited = 0;
        function check(): void {
            framesWaited += 1;

            // Require at least 4 frames so React's initial commit and first
            // mutation observer fire both land before the first "no pending"
            // resolution — two frames was not enough under browser mode.
            if (framesWaited >= 4 && container.querySelector("[data-pictel-pending]") === null) {
                resolve();

                return;
            }

            if (performance.now() - start > timeout) {
                const pending = Array.from(
                    container.querySelectorAll("[data-pictel-pipeline][data-pictel-pending]"),
                ).map((element) => element.tagName.toLowerCase());
                reject(new Error(`waitForPipeline timed out after ${String(timeout)}ms. Still pending: ${pending.join(", ") || "(descendants)"}.`));

                return;
            }

            requestAnimationFrame(check);
        }
        // Yield a macrotask first so React's initial commit has a chance to
        // land before we start polling frames.
        setTimeout(check, 0);
    });
}

/**
 * Navigate from a pipeline div to its output canvas via the known
 * content-last DOM structure: pipeline > rasterWrapper > rasterRef > canvas,
 * where the raster wrapper is the FIRST child of the pipeline div.
 * Returns the ImageData read from the canvas.
 */
export function readPipelineOutput(pipelineDiv: HTMLElement): ImageData {
    const rasterWrapper = pipelineDiv.firstElementChild;
    const rasterContainer = rasterWrapper?.firstElementChild;
    const canvas = rasterContainer?.firstElementChild;

    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("readPipelineOutput: could not find output canvas at expected DOM position");
    }

    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) throw new Error("readPipelineOutput: canvas 2d context unavailable");

    return context.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Sample a single pixel from ImageData. Returns [r, g, b, a] in 0-255.
 */
export function readPixel(
    pixels: ImageData,
    x: number,
    y: number,
): [number, number, number, number] {
    const index = (y * pixels.width + x) * 4;
    const red = pixels.data[index] ?? 0;
    const green = pixels.data[index + 1] ?? 0;
    const blue = pixels.data[index + 2] ?? 0;
    const alpha = pixels.data[index + 3] ?? 0;

    return [red, green, blue, alpha];
}

/**
 * Build a solid-color data URL using an offscreen canvas.
 */
export function solidImage(color: string, width: number, height: number): string {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) throw new Error("solidImage: canvas 2d context unavailable");

    context.fillStyle = color;
    context.fillRect(0, 0, width, height);

    return canvas.toDataURL();
}

/**
 * Build a horizontal or vertical gradient data URL.
 */
export function gradientImage(
    from: string,
    to: string,
    direction: "horizontal" | "vertical",
    width: number,
    height: number,
): string {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) throw new Error("gradientImage: canvas 2d context unavailable");

    const x2 = direction === "horizontal" ? width : 0;
    const y2 = direction === "vertical" ? height : 0;
    const gradient = context.createLinearGradient(0, 0, x2, y2);
    gradient.addColorStop(0, from);
    gradient.addColorStop(1, to);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    return canvas.toDataURL();
}

/**
 * Build a checkerboard pattern data URL. `size` is the square side in pixels.
 */
export function checkerboardImage(
    colorA: string,
    colorB: string,
    size: number,
    width: number,
    height: number,
): string {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) throw new Error("checkerboardImage: canvas 2d context unavailable");

    for (let y = 0; y < height; y += size) {
        for (let x = 0; x < width; x += size) {
            const isA = ((x / size) + (y / size)) % 2 === 0;
            context.fillStyle = isA ? colorA : colorB;
            context.fillRect(x, y, size, size);
        }
    }

    return canvas.toDataURL();
}
