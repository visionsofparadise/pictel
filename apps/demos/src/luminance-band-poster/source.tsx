import { LuminanceBands, Saturate } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function LuminanceBandPoster() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Saturate amount={1.4} mode="parameter">
				<LuminanceBands bands={5}>
					<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
				</LuminanceBands>
			</Saturate>
		</Canvas>
	);
}
