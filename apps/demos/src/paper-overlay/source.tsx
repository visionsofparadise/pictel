import { Overlay } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";
const PAPER_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/pencil-texture.jpg";

const W = 1024;
const H = 1536;

export default function PaperOverlay() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Overlay
				apply={<Image src={PAPER_URL} width={W} height={H} fit="cover" />}
			>
				<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" />
			</Overlay>
		</Canvas>
	);
}
