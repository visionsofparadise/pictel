import { ColorGrade, Invert } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function InvertNegative() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade temperature={1.0} saturation={0.85}>
				<Invert>
					<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				</Invert>
			</ColorGrade>
		</Canvas>
	);
}
