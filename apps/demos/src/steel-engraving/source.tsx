import { Brightness, Engrave } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function SteelEngraving() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Engrave spacing={5} angle={0} relief={3} crossHatch={true}>
				<Brightness amount={1.2} mode="parameter">
					<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" />
				</Brightness>
			</Engrave>
		</Canvas>
	);
}
