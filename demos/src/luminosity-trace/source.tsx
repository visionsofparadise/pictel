import { Luminosity } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";
const TEXTURE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/pencil-texture.jpg";

const W = 1024;
const H = 1024;

export default function LuminosityTrace() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Luminosity
				apply={
					<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
				}
			>
				<Image src={TEXTURE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Luminosity>
		</Canvas>
	);
}
