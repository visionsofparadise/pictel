import { Duotone } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const W = 1024;
const H = 1536;

const PRUSSIAN: [number, number, number] = [10, 30, 80];
const PAPER: [number, number, number] = [210, 228, 240];

export default function Cyanotype() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Duotone dark={PRUSSIAN} light={PAPER}>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</Duotone>
		</Canvas>
	);
}
