# @pictel/cli

Headless image renderer for [pictel](https://www.npmjs.com/package/pictel) compositions. Wraps Puppeteer + Sharp behind a `pictel render` command that takes a composition entry module and produces image files.

## Install

```bash
npm i -D @pictel/cli
```

## Usage

A composition is a module that default-exports a React component returning a `<Canvas>` (or a `<Viewer>` containing canvases). The CLI bundles the entry through Vite, runs it in a headless Chromium with `mode=render`, captures the canvas root, and encodes via Sharp.

Single render via flags:

```bash
npx pictel render \
  --entry src/Cover.tsx \
  --out out/cover.png \
  --width 1200 \
  --height 1200
```

Batch via `pictel.exports.ts` config:

```ts
import { defineExports } from "@pictel/cli"

export default defineExports([
  { name: "cover",  width: 1200, height: 1200 },
  { name: "banner", width: 1600, height: 600,  format: "webp", quality: 90 },
  { name: "card",   width: 800,  height: 800,  props: { variant: "dark" } },
])
```

Each entry's `name` becomes the output basename — files land at `<name>.<format>` in the current working directory (e.g. `cover.png`, `banner.webp`, `card.png`). All entries are rendered from the same `--entry` module; use `canvas` per entry when the composition is a `<Viewer>` with multiple `<Canvas>` instances.

Then:

```bash
npx pictel render --entry src/compositions.tsx --config pictel.exports.ts
```

## Flags

| Flag | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `--entry` | path | — | Composition entry module. **Required.** |
| `--config` | path | — | `pictel.exports.ts` path. When present, the file's entries drive the batch and most other flags are ignored. |
| `--canvas` | string | — | Canvas name when the composition is a `<Viewer>` with multiple canvases. |
| `--props` | JSON | — | JSON-encoded props delivered to the composition via `useProps()`. |
| `--width` | number | Canvas authored width | Output buffer width in pixels; overrides the composition's authored width. |
| `--height` | number | Canvas authored height | Output buffer height in pixels. |
| `--format` | `png` \| `jpeg` \| `webp` \| `avif` | `png` | Output format. |
| `--out` | path | `<name>.<format>` in cwd | Output file path. Single-entry runs only. |
| `--scale` | number | `1` | Device pixel-density multiplier (Puppeteer `deviceScaleFactor`). |

Per-entry encoding `quality` (1–100, ignored for `png`) is only configurable via `pictel.exports.ts`.

## How it works

The CLI owns the bundler shell (`packages/cli/shell/`, ships in the published package) — `index.html` + `entry.tsx` + a `virtual:pictel-entry` Vite plugin that imports the user's composition. Your project's `vite.config.*` is partially adopted: only the transform/resolve layer (`plugins`, `resolve`, `css`, `define`, `optimizeDeps`, `publicDir`) — never the app-shape layer.

A built shell is served via `vite preview`. Puppeteer navigates with `?mode=render&canvas=…&width=…&height=…&props=…`, waits for `[data-pictel-pending]` to clear (30s default), checks `data-pictel-error`, and element-screenshots `[data-pictel-canvas]` with `omitBackground: true`. Sharp encodes.

Per-entry render errors fail that entry but don't abort the batch; the run exits non-zero with a per-entry summary.

## Companion packages

- [`pictel`](https://www.npmjs.com/package/pictel) — framework primitives
- [`@pictel/effects`](https://www.npmjs.com/package/@pictel/effects) — standard library
- [`@pictel/ml`](https://www.npmjs.com/package/@pictel/ml) — ML effects
