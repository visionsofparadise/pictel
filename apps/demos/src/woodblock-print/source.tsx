import { Duotone, Hatch, Multiply } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";
const PAPER_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/pencil-texture.jpg";

const W = 1024;
const H = 1024;

const PI = Math.PI;
const INK: [number, number, number] = [22, 16, 12];
const RICE_PAPER: [number, number, number] = [236, 222, 198];

export default function WoodblockPrint() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={<Image src={PAPER_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />}
			>
				<Duotone dark={INK} light={RICE_PAPER}>
					<Hatch
						bands={3}
						angles={[PI / 4, -PI / 4, 0]}
						spacing={[8, 10, 14]}
					>
						<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
					</Hatch>
				</Duotone>
			</Multiply>
		</Canvas>
	);
}
