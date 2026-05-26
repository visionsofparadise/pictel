import { DisplacementMap, Overlay } from "@pictel/effects";
import { Canvas, Image } from "pictel";
import wall from "../../assets/Wall.jpg";
import mark from "../../assets/Mark.svg";

const canvasW = 1024;
const canvasH = 576;

const MARK_SIZE = 200;
const MARK_OFFSET_TOP = 48;
const MARK_OFFSET_RIGHT = 340;

/**
 * Behind: wall photo in natural flow.
 * Overlay: the mark is colorized to a saturated terracotta and DisplacementMap
 * warped by the wall's R/G channels, then composited via Overlay so the wall's
 * variation tonally modulates the mark — reads like printed/stenciled rather
 * than flat black. The mark sits in the upper half of the frame, clear of the
 * busier lower wall.
 */
export default function SVGOnConcrete() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Overlay
				apply={
					<DisplacementMap
						scaleX={6}
						scaleY={6}
						map={<Image src={wall} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />}
					>
						<div style={{ position: "relative", width: `${String(canvasW)}px`, height: `${String(canvasH)}px` }}>
							<div
								style={{
									position: "absolute",
									top: `${String(MARK_OFFSET_TOP)}px`,
									right: `${String(MARK_OFFSET_RIGHT)}px`,
									opacity: 0.95,
									filter: "invert(0.2) sepia(1) saturate(6) hue-rotate(-20deg)",
								}}
							>
								<Image src={mark} width={MARK_SIZE} height={MARK_SIZE} fit="contain" />
							</div>
						</div>
					</DisplacementMap>
				}
			>
				<Image src={wall} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
			</Overlay>
		</Canvas>
	);
}
