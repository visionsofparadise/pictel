import { ColorGrade, Grain } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function BleachBypass() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Grain intensity={14} seed={4137}>
				<ColorGrade brightness={1.08} contrast={1.45} saturation={0.35} temperature={-0.05} tint={0}>
					<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				</ColorGrade>
			</Grain>
		</Canvas>
	);
}
