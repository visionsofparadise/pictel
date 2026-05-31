import { Contrast, Grain, Grayscale, Threshold } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function XeroxCopy() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Grain intensity={28} seed={2811}>
				<Threshold threshold={130}>
					<Contrast amount={1.6} mode="parameter">
						<Grayscale>
							<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
						</Grayscale>
					</Contrast>
				</Threshold>
			</Grain>
		</Canvas>
	);
}
