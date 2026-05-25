import { defineExports } from "../src/config";

/**
 * Export config fixture for the Phase 5 end-to-end CLI validation against
 * `viewer-multi.tsx`. Exercises `--config`-driven batches: multi-canvas
 * selection (`canvas`), dimension override (`width`/`height`), and multiple
 * output formats (png, webp).
 *
 * A companion config `pictel.exports.props.ts` covers the props-driven fixture
 * `props-canvas.tsx` — the CLI takes a single `--entry` per invocation, so the
 * two compositions are split across two config files.
 */
export default defineExports([
  {
    name: "viewer-wide",
    canvas: "Wide",
    width: 240,
    height: 135,
    format: "png",
  },
  {
    name: "viewer-tall",
    canvas: "Tall",
    width: 150,
    height: 260,
    format: "webp",
    quality: 90,
  },
]);
