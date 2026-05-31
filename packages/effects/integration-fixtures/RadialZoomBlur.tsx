import { ZoomBlur } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const canvasW = 512;
const canvasH = 512;

export default function RadialZoomBlur() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<ZoomBlur centerX={0.5} centerY={0.42} length={66}>
				<Image src={HEADSHOT_URL} width={canvasW} height={canvasH} fit="cover" />
			</ZoomBlur>
		</Canvas>
	);
}
