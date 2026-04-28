import { Canvas, DisplacementMap, Map, Multiply } from "pictel";
import wall from "../../assets/Wall.jpg";
import mark from "../../assets/Mark.svg";

const W = 1024;
const H = 576;

/**
 * Behind: wall photo in natural flow.
 * Overlay: Multiply over the displaced SVG mark — DisplacementMap warps the
 * mark using the wall's R/G channels as the displacement field, so the icon
 * conforms to surface variation and reads as stenciled into the wall.
 */
export default function SVGOnConcrete() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ position: "relative" }}>
				<img src={wall} crossOrigin="anonymous" style={{ display: "block", width: W, height: H, objectFit: "cover" }} />
				<div style={{ position: "absolute", inset: 0 }}>
					<Multiply>
						<DisplacementMap scaleX={6} scaleY={6}>
							<Map>
								<img src={wall} crossOrigin="anonymous" style={{ display: "block", width: W, height: H, objectFit: "cover" }} />
							</Map>
							<img src={mark} style={{ display: "block", width: W, height: H, objectFit: "contain" }} />
						</DisplacementMap>
					</Multiply>
				</div>
			</div>
		</Canvas>
	);
}
