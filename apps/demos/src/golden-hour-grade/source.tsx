import { ColorGrade } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;

export default function GoldenHourGrade() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade brightness={1.05} contrast={1.15} saturation={1.25} temperature={1.4} tint={0.15}>
				<Image src={CITY_URL} width={W} height={H} fit="cover" />
			</ColorGrade>
		</Canvas>
	);
}
