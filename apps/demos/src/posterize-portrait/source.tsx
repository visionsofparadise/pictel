import { Posterize, Saturate } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-1.jpg";

const W = 1024;
const H = 1536;

export default function PosterizePortrait() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Saturate amount={1.45} mode="parameter">
				<Posterize levels={5}>
					<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
				</Posterize>
			</Saturate>
		</Canvas>
	);
}
