import { LIC, VectorField } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function RadialZoomBlur() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<LIC
				length={44}
				stepSize={1.5}
				map={
					<VectorField
						pattern="radial"
						magnitude="linear"
						centerX={0.5}
						centerY={0.42}
						width={W}
						height={H}
					/>
				}
			>
				<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</LIC>
		</Canvas>
	);
}
