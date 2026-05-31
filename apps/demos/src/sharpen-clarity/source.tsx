import { ColorGrade, Sharpen } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

export default function SharpenClarity() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade contrast={1.12} saturation={1.2}>
				<Sharpen amount={1.6}>
					<Image src={CITY_URL} width={W} height={H} fit="cover" />
				</Sharpen>
			</ColorGrade>
		</Canvas>
	);
}
