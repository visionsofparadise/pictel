// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { useProps } from "./useProps";

// Unit vitest config has no act-environment setup — declare it so act() flushes without warning.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function renderUseProps<T>(): T {
	let captured: T | undefined;

	function Probe() {
		captured = useProps<T>();

		return null;
	}

	const container = document.createElement("div");
	const root = createRoot(container);
	act(() => {
		root.render(createElement(Probe));
	});
	act(() => {
		root.unmount();
	});

	return captured as T;
}

afterEach(() => {
	window.history.replaceState(null, "", "/");
	vi.restoreAllMocks();
});

describe("useProps", () => {
	it("parses a valid JSON object from the props query parameter", () => {
		window.history.replaceState(null, "", `/?props=${encodeURIComponent('{"label":"Summer Sale","count":3}')}`);

		const props = renderUseProps<{ label: string; count: number }>();

		expect(props).toEqual({ label: "Summer Sale", count: 3 });
	});

	it("returns an empty object when the props parameter is absent", () => {
		window.history.replaceState(null, "", "/");

		expect(renderUseProps()).toEqual({});
	});

	it("returns an empty object and logs when the props JSON is malformed", () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		window.history.replaceState(null, "", `/?props=${encodeURIComponent("{not valid json")}`);

		expect(renderUseProps()).toEqual({});
		expect(errorSpy).toHaveBeenCalled();
	});
});
