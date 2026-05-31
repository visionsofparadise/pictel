import { Bilateral, Blur, Direction, DisplacementMap, EdgeDetect, Invert, Multiply } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function Watercolor() {
	const wash = (
		<Bilateral spatialSigma={11} colorSigma={32}>
			<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
		</Bilateral>
	);

	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={
					<Invert>
						<Blur radius={6}>
							<DisplacementMap
								useMagnitude
								scaleX={-14}
								scaleY={-14}
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
