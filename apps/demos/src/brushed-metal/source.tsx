import { ColorGrade, Direction, GradientMap, LIC, LinearGradient, ProceduralNoise } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1280;
const H = 800;

export default function BrushedMetal() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<GradientMap
				stops={[
					{ color: "#2a2c30", position: 0 },
					{ color: "#6a6d72", position: 0.5 },
					{ color: "#c8cbd0", position: 0.85 },
					{ color: "#f4f6f9", position: 1 },
				]}
			>
				<ColorGrade contrast={1.8} brightness={1}>
					<LIC
						length={80}
						stepSize={1.4}
						uniformStep
						map={
							<Direction mode="gradient">
								<LinearGradient
									width={W}
									height={H}
									angle={0}
									stops={[
										{ color: "rgb(0, 0, 0)", position: 0 },
										{ color: "rgb(255, 255, 255)", position: 1 },
									]}
								/>
							</Direction>
						}
					>
						<ProceduralNoise width={W} height={H} type="simplex" seed={6471} scale={0.08} octaves={3} />
					</LIC>
				</ColorGrade>
			</GradientMap>
		</Canvas>
	);
}
