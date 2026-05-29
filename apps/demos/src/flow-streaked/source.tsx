import { Direction, LIC } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function FlowStreaked() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<LIC
				length={40}
				stepSize={1.2}
				uniformStep
				map={
					<Direction mode="structure">
						<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
					</Direction>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</LIC>
		</Canvas>
	);
}
