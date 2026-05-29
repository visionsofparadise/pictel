# pictel

Pictel is a framework for Photoshop-like image editing via React code. It provides primitives for comprehensive pixel processing, live preview, and headless rendering.

This is the monorepo for the framework, its standard effect library, ML effects, the headless renderer, the design-system app, and the demo corpus.

## Packages

- [`pictel`](packages/pictel) — core React components: `Canvas`, `Image`, `Clip`, layout, and the raster pipeline that composites and previews everything. ([npm](https://www.npmjs.com/package/pictel))
- [`@pictel/effects`](packages/effects) — the effect library: colour grading, blurs, blend modes, halftone, displacement, line-integral convolution, generative sources, and more. ([npm](https://www.npmjs.com/package/@pictel/effects))
- [`@pictel/ml`](packages/ml) — ML-powered effects via Transformers.js + WebGPU: background removal, segmentation, depth maps, and upscaling. ([npm](https://www.npmjs.com/package/@pictel/ml))
- [`@pictel/cli`](packages/cli) — headless renderer (Puppeteer + Sharp) that exports compositions to PNG/JPEG/WebP/AVIF. ([npm](https://www.npmjs.com/package/@pictel/cli))

## Apps

- [`apps/design-system`](apps/design-system) — showcase for the viewer chrome and design tokens (Showcase / Preview / Display tabs). A development surface, not published.

## Demos

- [`apps/demos/`](apps/demos) — a corpus of worked examples. Each demo is a single composition with its intent, before/after images, and full source; rendered review surfaces live in [`apps/demos/out/`](apps/demos/out).

## Development

Managed with npm workspaces and [turbo](https://turbo.build/).

```bash
npm install
npx turbo run check unit build
```

See each package's README for usage — start with [`pictel`](packages/pictel).
