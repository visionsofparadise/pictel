import { Canvas, Lighten, Screen } from "pictel";
import landscape from "../../assets/Evening Landscape.jpg";
import degradedFilm from "../../assets/Degraded Film.jpg";
import lightLeak from "../../assets/Light Leak.jpg";

const W = 681;
const H = 1024;

/**
 * Three layers:
 *   Behind: landscape photo, in natural flow.
 *   Mid:    Lighten(light-leak) — the leak's black bg drops out via max-blend.
 *   Front:  Screen(damaged-film) — white scratches show, dark base discarded.
 */
export default function DamagedFilm() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ position: "relative" }}>
				<img src={landscape} crossOrigin="anonymous" style={{ display: "block", width: W, height: H, objectFit: "cover" }} />
				<div style={{ position: "absolute", inset: 0 }}>
					<Lighten>
						<img src={lightLeak} crossOrigin="anonymous" style={{ display: "block", width: W, height: H, objectFit: "cover" }} />
					</Lighten>
				</div>
				<div style={{ position: "absolute", inset: 0 }}>
					<Screen>
						<img src={degradedFilm} crossOrigin="anonymous" style={{ display: "block", width: W, height: H, objectFit: "cover" }} />
					</Screen>
				</div>
			</div>
		</Canvas>
	);
}
