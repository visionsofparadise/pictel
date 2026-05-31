import { DisplacementMap, VectorField } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1600;
const H = 1066;

export default function FisheyeLens() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<DisplacementMap
				useMagnitude
				scaleX={-120}
				scaleY={-120}
				map={<VectorField pattern="radial" magnitude="bump" width={W} height={H} />}
			>
				<Image src={CITY_URL} width={W} height={H} fit="cover" />
			</DisplacementMap>
		</Canvas>
	);
}
