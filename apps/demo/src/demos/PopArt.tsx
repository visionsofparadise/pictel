import { Contrast, Halftone, Multiply, Outline, Saturate, Threshold } from "@pictel/effects";
import { Canvas, Image } from "pictel";
import photo from "../../assets/Golden Hour Portrait.jpg";

export default function PopArt() {
	return (
		<Canvas mode="display" dimensions={{ width: 640, height: 960 }}>
			<Multiply
				apply={
					<Threshold threshold={140}>
						<Outline sigma={2.4} k={1.6} epsilon={0.005} phi={200}>
							<Image src={photo} width={640} height={960} fit="cover" crossOrigin="anonymous" />
						</Outline>
					</Threshold>
				}
			>
				<Halftone colorMode="color" dotSize={10}>
					<Contrast amount={1.35}>
						<Saturate amount={2.4}>
							<Image src={photo} width={640} height={960} fit="cover" crossOrigin="anonymous" />
						</Saturate>
					</Contrast>
				</Halftone>
			</Multiply>
		</Canvas>
	);
}
