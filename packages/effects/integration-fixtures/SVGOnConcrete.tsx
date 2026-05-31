import { DisplacementMap, Overlay } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const WALL_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/wall.jpg";
const MARK_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/mark.svg";

const canvasW = 1024;
const canvasH = 576;

const MARK_SIZE = 200;
const MARK_OFFSET_TOP = 48;
const MARK_OFFSET_RIGHT = 340;

export default function SVGOnConcrete() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Overlay
				apply={
					<DisplacementMap
						scaleX={6}
						scaleY={6}
						map={<Image src={WALL_URL} width={canvasW} height={canvasH} fit="cover" />}
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
								<Image src={MARK_URL} width={MARK_SIZE} height={MARK_SIZE} fit="contain" />
							</div>
						</div>
					</DisplacementMap>
				}
			>
				<Image src={WALL_URL} width={canvasW} height={canvasH} fit="cover" />
			</Overlay>
		</Canvas>
	);
}
