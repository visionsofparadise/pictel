import { Lighten } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";
const CITY_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/city-overview.jpg";

const W = 1024;
const H = 1024;

export default function DoubleExposure() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Lighten
				apply={<Image src={CITY_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />}
			>
				<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Lighten>
		</Canvas>
	);
}
