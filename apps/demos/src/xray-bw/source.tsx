import { Contrast, Grayscale, Invert } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function XrayBw() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Contrast amount={1.45} mode="parameter">
				<Invert>
					<Grayscale>
						<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
					</Grayscale>
				</Invert>
			</Contrast>
		</Canvas>
	);
}
