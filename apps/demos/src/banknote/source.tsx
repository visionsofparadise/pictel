import { Bilateral, Brightness, DisplacementMap, Duotone, Engrave } from "@pictel/effects";
import { DepthMap, RemoveBackground } from "@pictel/ml";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const INK: [number, number, number] = [24, 56, 38];
const CREAM: [number, number, number] = [234, 230, 213];
const canvasW = 512;
const canvasH = 512;

export default function Banknote() {
	const subject = (
		<RemoveBackground>
			<Image src={HEADSHOT_URL} width={canvasW} height={canvasH} fit="cover" />
		</RemoveBackground>
	);

	return (
		<Canvas
			mode="display"
			dimensions={{ width: canvasW, height: canvasH }}
			style={{ backgroundColor: `rgb(${String(CREAM[0])}, ${String(CREAM[1])}, ${String(CREAM[2])})` }}
		>
			<Duotone dark={INK} light={CREAM}>
				<DisplacementMap scaleX={10} scaleY={14} map={<DepthMap>{subject}</DepthMap>}>
					<Engrave spacing={5} relief={0}>
						<Brightness amount={1.35}>
							<Bilateral spatialSigma={4} colorSigma={60}>
								{subject}
							</Bilateral>
						</Brightness>
					</Engrave>
				</DisplacementMap>
			</Duotone>
		</Canvas>
	);
}
