import { Divide, LinearGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function DivideBleach() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Divide
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={45}
						stops={[
							{ color: "rgb(240, 220, 200)", position: 0 },
							{ color: "rgb(210, 190, 175)", position: 0.5 },
							{ color: "rgb(180, 160, 150)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</Divide>
		</Canvas>
	);
}
