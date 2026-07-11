import { Lighten, Screen } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "/evening-landscape.jpg";
const DEGRADED_FILM_URL = "/degraded-film.jpg";
const LIGHT_LEAK_URL = "/light-leak.jpg";

const canvasW = 681;
const canvasH = 1024;
const LEAK_W = Math.round(canvasW * 0.38);
const LEAK_H = Math.round(canvasH * 0.38);
const LEAK_OFFSET_TOP = -Math.round(canvasH * 0.04);
const LEAK_OFFSET_RIGHT = -Math.round(canvasW * 0.06);

export default function DamagedFilm() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Screen apply={<Image src={DEGRADED_FILM_URL} width={canvasW} height={canvasH} fit="cover" />}>
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
								<Image src={LIGHT_LEAK_URL} width={LEAK_W} height={LEAK_H} fit="cover" />
							</div>
						</div>
					}
				>
					<Image src={LANDSCAPE_URL} width={canvasW} height={canvasH} fit="cover" />
				</Lighten>
			</Screen>
		</Canvas>
	);
}
