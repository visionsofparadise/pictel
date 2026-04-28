/**
 * Pending state for pipeline elements.
 *
 * Replaces the previous direct `data-pictel-pending` attribute writes from
 * TargetEffect/CompositeEffect's gate/execute. The attribute is a brittle
 * coordination channel under React StrictMode: the same DOM node is reused
 * across the dev-time double-mount, so an aborted execute's `finally`
 * removing the attribute clobbered the second mount's freshly-set pending.
 *
 * Fix: refcounted state keyed by the pipeline DOM node. Each gate.proceed
 * calls `acquirePending` (increment, ensure attr=true). Each execute's
 * finally — including aborted ones — calls `releasePending` (decrement; if
 * zero, remove attr). Because every gate.proceed is paired with exactly one
 * execute (the synchronous `Promise.resolve().then(execute)` schedule), every
 * acquire is balanced by exactly one release. Under StrictMode:
 *
 *   1. mount1.gate.proceed → acquire → count=1
 *   2. (cleanup1 runs synchronously; controller1.abort)
 *   3. mount2.gate.proceed → acquire → count=2
 *   4. mount1.execute (microtask) → aborted → finally → release → count=1
 *   5. mount2.execute → completes → release → count=0, attr removed
 *
 * Outer pipelines and external readers (Canvas's "any descendant pending"
 * MutationObserver, design-system `export.ts` waitForReady, integration
 * tests' `waitForPipeline`, gate's `querySelector("[data-pictel-pending]")`,
 * Overflow's pending-attr reactivity, `tryFastPath`'s `inner.hasAttribute`)
 * continue reading the attribute. The attribute is a faithful view of the
 * count — it's set when count > 0 and removed when count drops to 0.
 *
 * The state is keyed by the DOM node via WeakMap, so unmounted elements are
 * garbage-collected without manual cleanup.
 */

const PENDING_ATTR = "data-pictel-pending";

const counts = new WeakMap<HTMLElement, number>();

/**
 * Increment the in-flight count for `pipelineEl` and ensure the attribute is
 * set. Called by gate.proceed. Each call must be balanced by a
 * `releasePending` from the corresponding execute's finally.
 */
export function acquirePending(pipelineEl: HTMLElement): void {
	const next = (counts.get(pipelineEl) ?? 0) + 1;
	counts.set(pipelineEl, next);

	if (pipelineEl.getAttribute(PENDING_ATTR) !== "true") {
		pipelineEl.setAttribute(PENDING_ATTR, "true");
	}
}

/**
 * Decrement the in-flight count for `pipelineEl`. If the count reaches zero,
 * remove the attribute. Called by execute's finally — both completed and
 * aborted executions release.
 */
export function releasePending(pipelineEl: HTMLElement): void {
	const current = counts.get(pipelineEl) ?? 0;
	const next = current > 0 ? current - 1 : 0;

	if (next === 0) {
		counts.delete(pipelineEl);

		if (pipelineEl.hasAttribute(PENDING_ATTR)) {
			pipelineEl.removeAttribute(PENDING_ATTR);
		}
	} else {
		counts.set(pipelineEl, next);
	}
}
