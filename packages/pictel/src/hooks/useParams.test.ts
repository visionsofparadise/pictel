// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { useParams } from "./useParams";

// Unit vitest config has no act-environment setup — declare it so act() flushes without warning.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function renderUseParams<T>(): T {
	let captured: T | undefined;

	function Probe() {
		captured = useParams<T>();

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

describe("useParams", () => {
	it("parses a valid JSON object from the params query parameter", () => {
		window.history.replaceState(null, "", `/?params=${encodeURIComponent('{"label":"Summer Sale","count":3}')}`);

		const params = renderUseParams<{ label: string; count: number }>();

		expect(params).toEqual({ label: "Summer Sale", count: 3 });
	});

	it("returns an empty object when the params parameter is absent", () => {
		window.history.replaceState(null, "", "/");

		expect(renderUseParams()).toEqual({});
	});

	it("returns an empty object and logs when the params JSON is malformed", () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		window.history.replaceState(null, "", `/?params=${encodeURIComponent("{not valid json")}`);

		expect(renderUseParams()).toEqual({});
		expect(errorSpy).toHaveBeenCalled();
	});
});
