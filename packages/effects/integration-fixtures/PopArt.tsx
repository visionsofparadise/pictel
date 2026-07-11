import { Contrast, Halftone, Multiply, Outline, Saturate, Threshold } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PHOTO_URL = "/golden-hour-portrait.jpg";

export default function PopArt() {
	return (
		<Canvas mode="display" dimensions={{ width: 640, height: 960 }}>
			<Multiply
				apply={
					<Threshold threshold={140}>
						<Outline sigma={2.4} k={1.6} epsilon={0.005} phi={200}>
							<Image src={PHOTO_URL} width={640} height={960} fit="cover" />
						</Outline>
					</Threshold>
				}
			>
				<Halftone colorMode="color" dotSize={10}>
					<Contrast amount={1.35}>
						<Saturate amount={2.4}>
							<Image src={PHOTO_URL} width={640} height={960} fit="cover" />
						</Saturate>
					</Contrast>
				</Halftone>
			</Multiply>
		</Canvas>
	);
}
