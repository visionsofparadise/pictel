import { Bilateral, ColorGrade } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function SoftPastel() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade brightness={1.1} contrast={0.85} saturation={0.7} temperature={0.05} tint={0.04}>
				<Bilateral spatialSigma={5} colorSigma={45}>
					<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
				</Bilateral>
			</ColorGrade>
		</Canvas>
	);
}
