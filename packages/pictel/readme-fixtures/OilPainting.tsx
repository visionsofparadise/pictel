import { Direction, Duotone, Hatch } from "@pictel/effects";
import { Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const INK: [number, number, number] = [38, 30, 54];
const PAPER: [number, number, number] = [240, 234, 220];

export const oilPaintingDimensions = { width: 640, height: 640 };

export const oilPaintingSourceUrl = HEADSHOT_URL;

export const OilPaintingComposition = (
	<Duotone dark={INK} light={PAPER}>
		<Hatch
			bands={4}
			spacing={[5, 8, 12, 16]}
			length={24}
			uniformStep
			map={
				<Direction mode="structure">
					<Image src={HEADSHOT_URL} width={640} height={640} fit="cover" />
				</Direction>
			}
		>
			<Image src={HEADSHOT_URL} width={640} height={640} fit="cover" />
		</Hatch>
	</Duotone>
);
