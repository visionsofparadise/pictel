export function waitForRasterEffect(
	container: HTMLElement,
	options: { timeout?: number } = {},
): Promise<void> {
	const timeout = options.timeout ?? 10000;

	return new Promise((resolve, reject) => {
		const start = performance.now();
		let framesWaited = 0;
		function check(): void {
			framesWaited += 1;

			if (framesWaited >= 4 && container.querySelector("[data-pictel-canvas][data-pictel-pending]") === null) {
				resolve();

				return;
			}

			if (performance.now() - start > timeout) {
				const pendingCanvases = Array.from(
					container.querySelectorAll<HTMLElement>("[data-pictel-canvas][data-pictel-pending]"),
				).map((element) => element.getAttribute("aria-label") ?? "(unnamed canvas)");
				reject(new Error(`waitForRasterEffect timed out after ${String(timeout)}ms. Canvas still pending: ${pendingCanvases.join(", ") || "(none located — selector returned nothing)"}.`));

				return;
			}

			requestAnimationFrame(check);
		}
		// Yield a macrotask first so React's initial commit lands before polling starts.
		setTimeout(check, 0);
	});
}
