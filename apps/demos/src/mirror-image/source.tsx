import { Canvas, Image } from "pictel";

const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1536;
const H = 1024;
const HALF = W / 2;

export default function MirrorImage() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ display: "flex", width: W, height: H }}>
				<Image src={CITY_URL} width={HALF} height={H} fit="cover" />
				<div style={{ transform: "scaleX(-1)", width: HALF, height: H }}>
					<Image src={CITY_URL} width={HALF} height={H} fit="cover" />
				</div>
			</div>
		</Canvas>
	);
}
