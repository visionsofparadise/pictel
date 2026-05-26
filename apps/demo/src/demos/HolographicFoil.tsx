import { Contrast, Grayscale, HardLight, Mask } from "@pictel/effects";
import { RemoveBackground } from "@pictel/ml";
import { Canvas, Image } from "pictel";
import headshot from "../../assets/headshot.jpg";
import foil from "../../assets/Foil Texture.jpg";

const canvasW = 1024;
const canvasH = 1024;

export default function HolographicFoil() {
	const subject = (
		<RemoveBackground>
			<Image src={headshot} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
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
					<Image src={foil} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
				</HardLight>
			</Mask>
		</Canvas>
	);
}
