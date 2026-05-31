import { ColorGrade } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function Moonlit() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade brightness={0.6} contrast={1.25} saturation={0.45} temperature={-1.2} tint={-0.15}>
				<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" />
			</ColorGrade>
		</Canvas>
	);
}
