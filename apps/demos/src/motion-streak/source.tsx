import { MotionBlur } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1280;
const H = 853;

export default function MotionStreak() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<MotionBlur angle={8} length={48}>
				<Image src={CITY_URL} width={W} height={H} fit="cover" />
			</MotionBlur>
		</Canvas>
	);
}
