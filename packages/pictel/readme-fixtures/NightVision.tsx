import { Contrast, Duotone, Grain, LinePattern, Multiply } from "@pictel/effects";
import { Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const WIDTH = 512;
const HEIGHT = 768;

const DARK_GREEN: [number, number, number] = [4, 18, 8];
const PHOSPHOR_GREEN: [number, number, number] = [120, 240, 110];

export const nightVisionDimensions = { width: WIDTH, height: HEIGHT };

export const nightVisionSourceUrl = LANDSCAPE_URL;

export const NightVisionComposition = (
	<Grain intensity={24} seed={6173}>
		<Multiply
			apply={
				<LinePattern
					width={WIDTH}
					height={HEIGHT}
					seed={0}
					spacing={3}
					thickness={1}
					angle={0}
					color="rgb(40, 80, 30)"
					background="rgb(230, 240, 220)"
				/>
			}
		>
			<Duotone dark={DARK_GREEN} light={PHOSPHOR_GREEN}>
				<Contrast amount={1.35} mode="parameter">
					<Image src={LANDSCAPE_URL} width={WIDTH} height={HEIGHT} fit="cover" crossOrigin="anonymous" />
				</Contrast>
			</Duotone>
		</Multiply>
	</Grain>
);
