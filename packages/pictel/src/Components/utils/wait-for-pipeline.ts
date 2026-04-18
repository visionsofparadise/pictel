/**
 * Poll until no element with [data-pictel-pending] exists in the container,
 * using requestAnimationFrame between checks. Rejects after timeout with a
 * diagnostic listing which pipelines are still pending. Waits a minimum of
 * four animation frames so React's initial commit and first mutation observer
 * fire both land before the first "no pending" resolution.
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
