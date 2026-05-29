import { Duotone, LIC, Multiply, ProceduralNoise, RadialGradient, VectorField } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1280;
const H = 800;

const RING_CENTER_X = -0.5;
const RING_CENTER_Y = 0.5;
const RING_RADIUS = 2.4;

const DARK: [number, number, number] = [60, 30, 15];
const LIGHT: [number, number, number] = [220, 170, 110];

export default function WoodPlank() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Duotone dark={DARK} light={LIGHT}>
				<Multiply
					apply={
						<RadialGradient
							width={W}
							height={H}
							centerX={RING_CENTER_X}
							centerY={RING_CENTER_Y}
							radius={RING_RADIUS}
							stops={[
								{ color: "#1a1a1a", position: 0.27 },
								{ color: "#f0f0f0", position: 0.31 },
								{ color: "#1a1a1a", position: 0.34 },
								{ color: "#f0f0f0", position: 0.42 },
								{ color: "#1a1a1a", position: 0.44 },
								{ color: "#f0f0f0", position: 0.53 },
								{ color: "#1a1a1a", position: 0.56 },
								{ color: "#f0f0f0", position: 0.65 },
								{ color: "#1a1a1a", position: 0.67 },
								{ color: "#f0f0f0", position: 0.78 },
								{ color: "#1a1a1a", position: 0.81 },
								{ color: "#f0f0f0", position: 0.93 },
								{ color: "#1a1a1a", position: 0.96 },
								{ color: "#f0f0f0", position: 1 },
							]}
						/>
					}
				>
					<LIC
						length={36}
						stepSize={1}
						uniformStep
						map={
							<VectorField
								width={W}
								height={H}
								pattern="tangential"
								centerX={RING_CENTER_X}
								centerY={RING_CENTER_Y}
							/>
						}
					>
						<ProceduralNoise width={W} height={H} type="simplex" seed={5021} scale={18} octaves={3} />
					</LIC>
				</Multiply>
			</Duotone>
		</Canvas>
	);
}
