import { defineExports } from "../src/config";

/**
 * Companion export config for the Phase 5 end-to-end CLI validation against
 * `props-canvas.tsx`. Exercises props delivery (`props`) — the composition
 * reads `label` via `useProps()` and varies its gradient palette with it.
 */
export default defineExports([
  {
    name: "props-warm",
    canvas: "Props",
    props: { label: "warm" },
    format: "png",
  },
]);
