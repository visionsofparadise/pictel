import { Canvas, Luminosity } from "pictel";
import { RemoveBackground } from "@pictel/ml";
import headshot from "../../assets/headshot.jpg";
import foil from "../../assets/Foil Texture.jpg";

const W = 1024;
const H = 1024;

/**
 * Behind: subject extracted via RemoveBackground (BEN2), in natural flow.
 * Overlay: foil composited via Luminosity blend — takes the foil's tonal map
 * with the subject's hue/saturation. Subject's alpha keeps the tint inside
 * the silhouette.
 */
export default function HolographicFoil() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ position: "relative" }}>
				<RemoveBackground>
					<img src={headshot} crossOrigin="anonymous" style={{ display: "block", width: W, height: H, objectFit: "cover" }} />
				</RemoveBackground>
				<div style={{ position: "absolute", inset: 0 }}>
					<Luminosity>
						<img src={foil} crossOrigin="anonymous" style={{ display: "block", width: W, height: H, objectFit: "cover" }} />
					</Luminosity>
				</div>
			</div>
		</Canvas>
	);
}
