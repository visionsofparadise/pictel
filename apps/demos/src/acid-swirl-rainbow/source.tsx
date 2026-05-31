import { ColorGrade, GradientMap, ProceduralNoise, SwirlBlur } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1280;
const H = 1280;

export default function AcidSwirlRainbow() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<GradientMap
				stops={[
					{ color: "#4b0082", position: 0 },
					{ color: "#1a4cff", position: 0.17 },
					{ color: "#00d8ff", position: 0.34 },
					{ color: "#32d048", position: 0.5 },
					{ color: "#ffe700", position: 0.67 },
					{ color: "#ff7a00", position: 0.84 },
					{ color: "#ff2bb0", position: 1 },
				]}
			>
				<ColorGrade contrast={20}>
					<SwirlBlur length={20}>
						<ProceduralNoise width={W} height={H} type="simplex" seed={7} scale={4} octaves={4} />
					</SwirlBlur>
				</ColorGrade>
			</GradientMap>
		</Canvas>
	);
}
