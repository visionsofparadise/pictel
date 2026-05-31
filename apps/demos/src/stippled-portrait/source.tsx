import { Contrast, Grayscale, Halftone } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function StippledPortrait() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Halftone dotSize={5} angle={0} colorMode="luminance" dotColor={[12, 12, 12]}>
				<Contrast amount={1.25} mode="parameter">
					<Grayscale>
						<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" />
					</Grayscale>
				</Contrast>
			</Halftone>
		</Canvas>
	);
}
