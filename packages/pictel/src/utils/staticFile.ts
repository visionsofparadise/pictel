/**
 * Resolves a path within the served `public/` directory to a root-relative URL.
 *
 * Pictel adopts Remotion's convention: assets placed in a `public/` directory
 * are served at the web root. File-valued props (e.g. a hero image path) are
 * passed to a composition as plain strings — query-param JSON cannot carry live
 * file handles — and resolved at render time with this helper:
 *
 * ```tsx
 * const { heroImage } = useProps();
 * return <Image src={staticFile(heroImage)} />;
 * ```
 *
 * Any leading `./` or `/` is stripped and the remainder is prefixed with `/`,
 * so `"hero.jpg"`, `"./hero.jpg"`, and `"/hero.jpg"` all resolve to
 * `"/hero.jpg"`.
 *
 * Known limitation: this assumes the app is served from the root. A non-root
 * Vite `base` is not accounted for — the returned URL would need the `base`
 * prefix prepended manually in that case.
 *
 * @param path - A path to an asset within the `public/` directory.
 * @returns The root-relative URL for the asset.
 * @category Utilities
 */
export function staticFile(path: string): string {
	const normalized = path.replace(/^\.?\//, "");

	return `/${normalized}`;
}
