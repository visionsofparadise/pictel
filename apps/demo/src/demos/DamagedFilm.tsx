import { Canvas, Image, Lighten, Screen } from "pictel";
import landscape from "../../assets/Evening Landscape.jpg";
import degradedFilm from "../../assets/Degraded Film.jpg";
import lightLeak from "../../assets/Light Leak.jpg";

const canvasW = 681;
const canvasH = 1024;
const LEAK_W = Math.round(canvasW * 0.38);
const LEAK_H = Math.round(canvasH * 0.38);
const LEAK_OFFSET_TOP = -Math.round(canvasH * 0.04);
const LEAK_OFFSET_RIGHT = -Math.round(canvasW * 0.06);

/**
 * Three layers:
 *   Behind: landscape photo, in natural flow.
 *   Mid:    Lighten(light-leak) at 60% opacity — leak's black bg drops out
 *           via max-blend; the leak texture is scaled to ~38% and offset so
 *           the bright sun-flare lands in the upper-right corner rather
 *           than dominating the frame.
 *   Front:  Screen(damaged-film) — white scratches show, dark base discarded.
 */
export default function DamagedFilm() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Screen apply={<Image src={degradedFilm} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />}>
				<Lighten
					opacity={0.6}
					apply={
						<div style={{ position: "relative", width: "100%", height: "100%", backgroundColor: "black" }}>
							<div
								style={{
									position: "absolute",
									top: `${String(LEAK_OFFSET_TOP)}px`,
									right: `${String(LEAK_OFFSET_RIGHT)}px`,
								}}
							>
								<Image src={lightLeak} width={LEAK_W} height={LEAK_H} fit="cover" crossOrigin="anonymous" />
							</div>
						</div>
					}
				>
					<Image src={landscape} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
				</Lighten>
			</Screen>
		</Canvas>
	);
}
