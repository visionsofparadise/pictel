import { defineExports } from "../src/config";

export default defineExports([
  {
    name: "viewer-wide",
    canvas: "Wide",
    canvasWidth: 240,
    canvasHeight: 135,
    format: "png",
  },
  {
    name: "viewer-tall",
    canvas: "Tall",
    canvasWidth: 150,
    canvasHeight: 260,
    format: "webp",
    quality: 90,
  },
]);
