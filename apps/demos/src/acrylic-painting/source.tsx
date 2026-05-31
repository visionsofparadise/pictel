import { Bilateral, Saturate, Sharpen } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function AcrylicPainting() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Sharpen amount={0.9}>
				<Saturate amount={1.3} mode="parameter">
					<Bilateral spatialSigma={9} colorSigma={38}>
						<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" />
					</Bilateral>
				</Saturate>
			</Sharpen>
		</Canvas>
	);
}
