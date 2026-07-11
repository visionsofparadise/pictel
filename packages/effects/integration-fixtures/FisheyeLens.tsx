import { DisplacementMap, VectorField } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "/city-overview.jpg";

const canvasW = 512;
const canvasH = 512;

export default function FisheyeLens() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<DisplacementMap
				useMagnitude
				scaleX={-38}
				scaleY={-38}
				map={<VectorField pattern="radial" magnitude="bump" width={canvasW} height={canvasH} />}
			>
				<Image src={CITY_URL} width={canvasW} height={canvasH} fit="cover" />
			</DisplacementMap>
		</Canvas>
	);
}
