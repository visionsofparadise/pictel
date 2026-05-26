import { Bilateral, LuminanceBands, Multiply, Outline, Saturate, Threshold } from "@pictel/effects";
import { Canvas, Image } from "pictel";
import headshot from "../../assets/headshot.jpg";

const canvasW = 512;
const canvasH = 512;

export default function CelShade() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Multiply
				apply={
					<Threshold threshold={140}>
						<Outline sigma={2.6} k={1.6} epsilon={0.005} phi={200}>
							<Image src={headshot} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
						</Outline>
					</Threshold>
				}
			>
				<Saturate amount={1.5}>
					<LuminanceBands bands={3}>
						<Bilateral spatialSigma={4} colorSigma={45}>
							<Image src={headshot} width={canvasW} height={canvasH} fit="cover" crossOrigin="anonymous" />
						</Bilateral>
					</LuminanceBands>
				</Saturate>
			</Multiply>
		</Canvas>
	);
}
