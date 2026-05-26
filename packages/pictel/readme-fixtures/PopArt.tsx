import { Contrast, Halftone, Multiply, Outline, Saturate, Threshold } from "@pictel/effects";
import { Image } from "pictel";

const GOLDEN_HOUR_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

export const popArtDimensions = { width: 640, height: 960 };

export const popArtSourceUrl = GOLDEN_HOUR_URL;

export const PopArtComposition = (
	<Multiply
		apply={
			<Threshold threshold={140}>
				<Outline sigma={2.4} k={1.6} epsilon={0.005} phi={200}>
					<Image src={GOLDEN_HOUR_URL} width={640} height={960} fit="cover" crossOrigin="anonymous" />
				</Outline>
			</Threshold>
		}
	>
		<Halftone colorMode="color" dotSize={10}>
			<Contrast amount={1.35}>
				<Saturate amount={2.4}>
					<Image src={GOLDEN_HOUR_URL} width={640} height={960} fit="cover" crossOrigin="anonymous" />
				</Saturate>
			</Contrast>
		</Halftone>
	</Multiply>
);
