import { Exclusion, LinearGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const LANDSCAPE_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/evening-landscape.jpg";

const W = 1024;
const H = 1536;

export default function ExclusionPastel() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Exclusion
				apply={
					<LinearGradient
						width={W}
						height={H}
						angle={135}
						stops={[
							{ color: "rgb(140, 200, 220)", position: 0 },
							{ color: "rgb(220, 180, 200)", position: 0.5 },
							{ color: "rgb(180, 220, 160)", position: 1 },
						]}
					/>
				}
			>
				<Image src={LANDSCAPE_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Exclusion>
		</Canvas>
	);
}
