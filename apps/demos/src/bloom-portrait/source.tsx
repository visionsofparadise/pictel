import { Bloom } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function BloomPortrait() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Bloom threshold={0.6} radius={40} intensity={1.4}>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Bloom>
		</Canvas>
	);
}
