import { MotionBlur } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const canvasW = 512;
const canvasH = 512;

export default function MotionStreak() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<MotionBlur angle={8} length={48}>
				<Image src={CITY_URL} width={canvasW} height={canvasH} fit="cover" />
			</MotionBlur>
		</Canvas>
	);
}
