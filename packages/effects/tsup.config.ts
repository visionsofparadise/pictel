import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  treeshake: true,
  clean: true,
  external: ["react", "react-dom", "pictel"],
  // Phase 22 (GPU effects) imports `.wgsl?raw` files. `?raw` is Vite-specific;
  // esbuild needs a loader entry to handle the `.wgsl` extension as plain text.
  // Without this, the `tsup` build fails on `bilateral-gpu.wgsl?raw` and
  // `lic-gpu.wgsl?raw` imports.
  loader: {
    ".wgsl": "text",
  },
});
