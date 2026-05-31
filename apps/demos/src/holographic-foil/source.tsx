import { Contrast, Grayscale, HardLight, Mask } from "@pictel/effects";
import { RemoveBackground } from "@pictel/ml";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";
const FOIL_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/foil-texture.jpg";

const canvasW = 1024;
const canvasH = 1024;

export default function HolographicFoil() {
	const subject = (
		<RemoveBackground>
			<Image src={HEADSHOT_URL} width={canvasW} height={canvasH} fit="cover" />
		</RemoveBackground>
	);

	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Mask map={subject}>
				<HardLight
					apply={
						<Grayscale>
							<Contrast amount={1.4}>{subject}</Contrast>
						</Grayscale>
					}
				>
					<Image src={FOIL_URL} width={canvasW} height={canvasH} fit="cover" />
				</HardLight>
			</Mask>
		</Canvas>
	);
}
