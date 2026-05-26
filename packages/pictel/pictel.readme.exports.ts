import { defineExports } from "../cli/src/config";

export default defineExports([
	{ name: "oil-painting-before", canvas: "oil-painting-before", width: 600, height: 600, format: "png" },
	{ name: "oil-painting-after", canvas: "oil-painting-after", width: 600, height: 600, format: "png" },
	{ name: "pop-art-before", canvas: "pop-art-before", width: 400, height: 600, format: "png" },
	{ name: "pop-art-after", canvas: "pop-art-after", width: 400, height: 600, format: "png" },
	{ name: "tilt-shift-before", canvas: "tilt-shift-before", width: 600, height: 400, format: "png" },
	{ name: "tilt-shift-after", canvas: "tilt-shift-after", width: 600, height: 400, format: "png" },
]);
