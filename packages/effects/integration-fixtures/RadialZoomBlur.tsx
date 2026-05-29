import { LIC, VectorField } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const canvasW = 512;
const canvasH = 512;

export default function RadialZoomBlur() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<LIC
				length={44}
				stepSize={1.5}
				map={
					<VectorField
						pattern="radial"
						magnitude="linear"
						centerX={0.5}
						centerY={0.42}
						width={canvasW}
						height={canvasH}
					/>
				}
			>
				<Image src={HEADSHOT_URL} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
			</LIC>
		</Canvas>
	);
}
