import { DepthMap } from "@pictel/ml";
import { Canvas, Map, TargetEffect } from "pictel";
import { useCallback } from "react";
import cityPhoto from "../../assets/city overview.jpg";

const MAX_PARALLAX = 80;

/**
 * Red/cyan anaglyph 3D. Per-pixel parallax = depth × MAX_PARALLAX, with the
 * red channel sampled to the left and green/blue to the right. Single
 * TargetEffect; no layered blends.
 */
export default function Anaglyph() {
	const effect = useCallback((pixels: ImageData, map?: ImageData) => {
		if (!map) throw new Error("Anaglyph requires a depth Map child");
		const { width, height } = pixels;
		const out = new ImageData(width, height);
		function sample(buf: ImageData, x: number, y: number, channel: 0 | 1 | 2 | 3): number {
			const ix = Math.max(0, Math.min(width - 1, Math.floor(x)));
			const iy = Math.max(0, Math.min(height - 1, Math.floor(y)));
			return buf.data[(iy * width + ix) * 4 + channel] ?? 0;
		}
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const i = (y * width + x) * 4;
				const depth = (map.data[i] ?? 0) / 255;
				const px = depth * MAX_PARALLAX;
				out.data[i + 0] = sample(pixels, x - px, y, 0);
				out.data[i + 1] = sample(pixels, x + px, y, 1);
				out.data[i + 2] = sample(pixels, x + px, y, 2);
				out.data[i + 3] = 255;
			}
		}
		return out;
	}, []);

	return (
		<Canvas mode="display" dimensions={{ width: 1024, height: 683 }}>
			<TargetEffect effect={effect}>
				<img
					src={cityPhoto}
					crossOrigin="anonymous"
					style={{ display: "block", maxWidth: "100%" }}
				/>
				<Map>
					<DepthMap>
						<img
							src={cityPhoto}
							crossOrigin="anonymous"
							style={{ display: "block", maxWidth: "100%" }}
						/>
					</DepthMap>
				</Map>
			</TargetEffect>
		</Canvas>
	);
}
