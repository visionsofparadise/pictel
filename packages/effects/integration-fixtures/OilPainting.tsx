import { Direction, Duotone, Hatch } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "/headshot.jpg";

const INK: [number, number, number] = [38, 30, 54];
const PAPER: [number, number, number] = [240, 234, 220];

export default function OilPainting() {
	return (
		<Canvas mode="display" dimensions={{ width: 640, height: 640 }}>
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
		</Canvas>
	);
}
