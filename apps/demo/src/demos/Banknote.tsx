import { Canvas, Direction, Duotone, LIC, LinePattern, Map, Multiply } from "pictel";
import headshot from "../../assets/headshot.jpg";

const INK: [number, number, number] = [26, 61, 39];
const CREAM: [number, number, number] = [232, 228, 208];
const W = 512;
const H = 512;

/**
 * Behind: Duotone(photo) — banknote ink-on-paper render in natural flow.
 * Overlay: Multiply'd line engraving — LIC smears a horizontal LinePattern
 * along the photo's Direction field, producing contour-following strokes.
 */
export default function Banknote() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ position: "relative" }}>
				<Duotone dark={INK} light={CREAM}>
					<img src={headshot} crossOrigin="anonymous" style={{ display: "block", width: W, height: H, objectFit: "cover" }} />
				</Duotone>
				<div style={{ position: "absolute", inset: 0 }}>
					<Multiply>
						<LIC length={20} stepSize={1.5}>
							<Map>
								<Direction>
									<img src={headshot} crossOrigin="anonymous" style={{ display: "block", width: W, height: H, objectFit: "cover" }} />
								</Direction>
							</Map>
							<LinePattern width={W} height={H} seed={0} spacing={6} thickness={1} color="#000000" background="#ffffff" />
						</LIC>
					</Multiply>
				</div>
			</div>
		</Canvas>
	);
}
