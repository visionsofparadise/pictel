import { Bilateral, Blur, Direction, DisplacementMap, EdgeDetect, Invert, Multiply } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "/golden-hour-portrait.jpg";

const canvasW = 512;
const canvasH = 512;

export default function Watercolor() {
	const wash = (
		<Bilateral spatialSigma={11} colorSigma={32}>
			<Image src={PORTRAIT_URL} width={canvasW} height={canvasH} fit="cover" />
		</Bilateral>
	);

	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Multiply
				apply={
					<Invert>
						<Blur radius={6}>
							<DisplacementMap
								useMagnitude
								scaleX={-7}
								scaleY={-7}
								map={<Direction mode="gradient" space="color">{wash}</Direction>}
							>
								<EdgeDetect space="color">{wash}</EdgeDetect>
							</DisplacementMap>
						</Blur>
					</Invert>
				}
			>
				{wash}
			</Multiply>
		</Canvas>
	);
}
