import { DisplacementMap, VectorField } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function TwirlDistortion() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<DisplacementMap
				useMagnitude
				scaleX={110}
				scaleY={110}
				map={<VectorField pattern="tangential" magnitude="falloff" width={W} height={H} />}
			>
				<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</DisplacementMap>
		</Canvas>
	);
}
