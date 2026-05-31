import { ZoomBlur } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function RadialZoomBlur() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ZoomBlur centerX={0.5} centerY={0.42} length={66}>
				<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" />
			</ZoomBlur>
		</Canvas>
	);
}
