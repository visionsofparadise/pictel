import { ColorGrade, GradientMap, ProceduralNoise } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1280;
const H = 1280;

export default function LavaPool() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<GradientMap
				stops={[
					{ color: "#1a0006", position: 0 },
					{ color: "#5a0018", position: 0.25 },
					{ color: "#c81a18", position: 0.5 },
					{ color: "#ff6a18", position: 0.72 },
					{ color: "#ffd040", position: 0.88 },
					{ color: "#fff6c8", position: 1 },
				]}
			>
				<ColorGrade contrast={1.9} brightness={1}>
					<ProceduralNoise width={W} height={H} type="simplex" seed={5417} scale={0.012} octaves={4} />
				</ColorGrade>
			</GradientMap>
		</Canvas>
	);
}
