const allChanges: MutationObserverInit = { childList: true, attributes: true, subtree: true, characterData: true };

export function observeSubtree(observer: MutationObserver, target: Node): void {
	observer.observe(target, allChanges);
}
