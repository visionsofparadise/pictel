import { Bilateral, Brightness, DisplacementMap, Duotone, Engrave } from "@pictel/effects";
import { DepthMap, RemoveBackground } from "@pictel/ml";
import { Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const INK: [number, number, number] = [24, 56, 38];
const CREAM: [number, number, number] = [234, 230, 213];

const WIDTH = 512;
const HEIGHT = 512;

export const banknoteDimensions = { width: WIDTH, height: HEIGHT };

export const banknoteSourceUrl = HEADSHOT_URL;

export const banknoteBackground = `rgb(${String(CREAM[0])}, ${String(CREAM[1])}, ${String(CREAM[2])})`;

const subject = (
	<RemoveBackground>
		<Image src={HEADSHOT_URL} width={WIDTH} height={HEIGHT} fit="cover" />
	</RemoveBackground>
);

export const BanknoteComposition = (
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
);
