import { DepthMap } from "@pictel/ml";
import { Canvas, Pipeline, type PipelineCallback } from "pictel";
import { useCallback } from "react";
import cityPhoto from "../../assets/city overview.jpg";

const MAX_PARALLAX = 18;
const canvasW = 1024;
const canvasH = 683;

/**
 * Red/cyan anaglyph 3D. Per-pixel parallax = depth × MAX_PARALLAX, with the
 * red channel sampled to the left and green/blue to the right. Single
 * Pipeline; depth map passed via the map prop.
 */
export default function Anaglyph() {
	const effect = useCallback<PipelineCallback>((pixels, _apply, map) => {
		if (!map) throw new Error("Anaglyph requires a depth map");

		const { width, height } = pixels;
		const out = new ImageData(width, height);
		function sample(buf: ImageData, x: number, y: number, channel: 0 | 1 | 2 | 3): number {
			const ix = Math.max(0, Math.min(width - 1, Math.floor(x)));
			const iy = Math.max(0, Math.min(height - 1, Math.floor(y)));

			return buf.data[(iy * width + ix) * 4 + channel] ?? 0;
		}

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const offset = (y * width + x) * 4;
				const depth = (map.data[offset] ?? 0) / 255;
				const px = depth * MAX_PARALLAX;
				out.data[offset + 0] = sample(pixels, x - px, y, 0);
				out.data[offset + 1] = sample(pixels, x + px, y, 1);
				out.data[offset + 2] = sample(pixels, x + px, y, 2);
				out.data[offset + 3] = 255;
			}
		}

		return { pixels: out };
	}, []);

	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Pipeline
				effect={effect}
				map={
					<DepthMap>
						<img src={cityPhoto} crossOrigin="anonymous" style={{ display: "block", width: canvasW, height: canvasH, objectFit: "cover" }} />
					</DepthMap>
				}
			>
				<img src={cityPhoto} crossOrigin="anonymous" style={{ display: "block", width: canvasW, height: canvasH, objectFit: "cover" }} />
			</Pipeline>
		</Canvas>
	);
}
