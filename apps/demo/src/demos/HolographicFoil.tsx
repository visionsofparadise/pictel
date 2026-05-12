import { Canvas, Color, Pipeline, type PipelineCallback } from "pictel";
import { RemoveBackground } from "@pictel/ml";
import { useCallback } from "react";
import headshot from "../../assets/headshot.jpg";
import foil from "../../assets/Foil Texture.jpg";

const canvasW = 1024;
const canvasH = 1024;

/**
 * Behind: subject extracted via RemoveBackground (BEN2), in natural flow.
 * Overlay: foil composited via Color blend — takes the foil's hue and
 * saturation with the subject's luminosity. Luminosity is the brightness map
 * that carries facial features and tonal detail; preserving it (rather than
 * replacing it as the inverse Luminosity blend would) keeps the subject
 * recognizable while the foil supplies the iridescent color.
 *
 * The outer Pipeline re-uses the subject silhouette as a `map` and clamps the
 * output alpha to the subject's alpha. Without this, the foil's opaque pixels
 * would composite over the transparent background (W3C blend semantics:
 * `outA = sa + da*(1-sa)`), turning the whole frame foil. The clamp restricts
 * the foil to inside the subject silhouette.
 */
export default function HolographicFoil() {
	const maskToSubject = useCallback<PipelineCallback>((target, _apply, map) => {
		if (!map) throw new Error("HolographicFoil mask requires the subject silhouette");

		const out = new ImageData(target.width, target.height);
		const td = target.data;
		const md = map.data;
		const od = out.data;

		for (let px = 0; px < td.length; px += 4) {
			od[px] = td[px] ?? 0;
			od[px + 1] = td[px + 1] ?? 0;
			od[px + 2] = td[px + 2] ?? 0;
			od[px + 3] = md[px + 3] ?? 0;
		}

		return { pixels: out };
	}, []);

	const subject = (
		<RemoveBackground>
			<img src={headshot} crossOrigin="anonymous" style={{ display: "block", width: canvasW, height: canvasH, objectFit: "cover" }} />
		</RemoveBackground>
	);

	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Pipeline effect={maskToSubject} map={subject}>
				<Color apply={<img src={foil} crossOrigin="anonymous" style={{ display: "block", width: canvasW, height: canvasH, objectFit: "cover" }} />}>
					{subject}
				</Color>
			</Pipeline>
		</Canvas>
	);
}
