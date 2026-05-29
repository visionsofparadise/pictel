import { Duotone, Grain, Multiply, RadialGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function Tintype() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.5}
						radius={0.7}
						stops={[
							{ color: "rgba(255, 250, 240, 1)", position: 0 },
							{ color: "rgba(190, 165, 130, 1)", position: 0.65 },
							{ color: "rgba(20, 14, 10, 1)", position: 1 },
						]}
					/>
				}
			>
				<Grain intensity={22} seed={1859}>
					<Duotone dark={[28, 22, 16]} light={[232, 214, 178]}>
						<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
					</Duotone>
				</Grain>
			</Multiply>
		</Canvas>
	);
}
