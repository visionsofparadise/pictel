import { DisplacementMap, VectorField } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const canvasW = 512;
const canvasH = 512;

export default function TwirlDistortion() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<DisplacementMap
				useMagnitude
				scaleX={110}
				scaleY={110}
				map={<VectorField pattern="tangential" magnitude="falloff" width={canvasW} height={canvasH} />}
			>
				<Image src={HEADSHOT_URL} width={canvasW} height={canvasH} fit="cover" />
			</DisplacementMap>
		</Canvas>
	);
}
