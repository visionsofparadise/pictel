import { ConicGradient, DropShadow } from "@pictel/effects";
import { RemoveBackground } from "@pictel/ml";
import { Canvas, Clip, Image } from "pictel";
import portrait from "../../assets/Portrait with Background 2.jpg";

const canvasW = 713;
const canvasH = 1024;

export default function BackgroundReplace() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<div style={{ position: "relative" }}>
				<ConicGradient
					width={canvasW}
					height={canvasH}
					stops={[
						{ color: "#ff7e5f", position: 0 },
						{ color: "#feb47b", position: 0.3 },
						{ color: "#7ec8e3", position: 0.6 },
						{ color: "#5b6cb5", position: 1 },
					]}
				/>
				<div style={{ position: "absolute", inset: 0 }}>
					<Clip>
						<DropShadow offsetX={0} offsetY={20} blurRadius={30} color="#000000">
							<RemoveBackground>
								<Image src={portrait} width={canvasW} height={canvasH} fit="contain" crossOrigin="anonymous" />
							</RemoveBackground>
						</DropShadow>
					</Clip>
				</div>
			</div>
		</Canvas>
	);
}
