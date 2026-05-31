import { SegFormer } from "@pictel/ml";
import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1024;
const H = 683;

export default function SegformerSegmented() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<SegFormer>
				<Image src={CITY_URL} width={W} height={H} fit="cover" />
			</SegFormer>
		</Canvas>
	);
}
