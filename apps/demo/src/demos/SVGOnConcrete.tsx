import { Canvas, DisplacementMap, Overlay } from "pictel";
import wall from "../../assets/Wall.jpg";
import mark from "../../assets/Mark.svg";

const canvasW = 1024;
const canvasH = 576;

const MARK_SIZE = 280;
const MARK_OFFSET_TOP = 80;
const MARK_OFFSET_RIGHT = 140;

/**
 * Behind: wall photo in natural flow.
 * Overlay: the mark is colorized to a saturated terracotta and DisplacementMap
 * warped by the wall's R/G channels, then composited via Overlay so the wall's
 * variation tonally modulates the mark — reads like printed/stenciled rather
 * than flat black. The mark sits smaller and shifted up-right of center so it
 * lands on a clean part of the wall.
 */
export default function SVGOnConcrete() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Overlay
				apply={
					<DisplacementMap
						scaleX={6}
						scaleY={6}
						map={<img src={wall} crossOrigin="anonymous" style={{ display: "block", width: canvasW, height: canvasH, objectFit: "cover" }} />}
					>
						<div style={{ position: "relative", width: "100%", height: "100%" }}>
							<img
								src={mark}
								style={{
									position: "absolute",
									top: `${String(MARK_OFFSET_TOP)}px`,
									right: `${String(MARK_OFFSET_RIGHT)}px`,
									width: MARK_SIZE,
									height: MARK_SIZE,
									objectFit: "contain",
									opacity: 0.95,
									filter: "invert(0.2) sepia(1) saturate(6) hue-rotate(-20deg)",
								}}
							/>
						</div>
					</DisplacementMap>
				}
			>
				<img src={wall} crossOrigin="anonymous" style={{ display: "block", width: canvasW, height: canvasH, objectFit: "cover" }} />
			</Overlay>
		</Canvas>
	);
}
