import { GradientMap } from "@pictel/effects";
import { RemoveBackground } from "@pictel/ml";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-2.jpg";

const W = 713;
const H = 1024;

export default function SilhouetteCutout() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<div style={{ position: "relative", width: "100%", height: "100%" }}>
				<div style={{ position: "absolute", inset: 0, background: "#f3c244" }} />
				<div style={{ position: "absolute", inset: 0 }}>
					<GradientMap
						stops={[
							{ color: "#0a0a12", position: 0 },
							{ color: "#0a0a12", position: 1 },
						]}
					>
						<RemoveBackground>
							<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
						</RemoveBackground>
					</GradientMap>
				</div>
			</div>
		</Canvas>
	);
}
