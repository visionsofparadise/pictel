import { ColorGrade, Direction, Duotone, LIC, LinearGradient, ProceduralNoise } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1280;
const H = 1280;

const SHADOW: [number, number, number] = [22, 14, 38];
const HIGHLIGHT: [number, number, number] = [240, 180, 220];

export default function AbstractFlowPainting() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade saturation={1.2} contrast={1.15}>
				<Duotone dark={SHADOW} light={HIGHLIGHT}>
					<LIC
						length={60}
						stepSize={1.5}
						uniformStep
						map={
							<Direction mode="gradient">
								<LinearGradient
									width={W}
									height={H}
									angle={30}
									stops={[
										{ color: "rgb(0, 0, 0)", position: 0 },
										{ color: "rgb(255, 255, 255)", position: 1 },
									]}
								/>
							</Direction>
						}
					>
						<ProceduralNoise
							width={W}
							height={H}
							type="simplex"
							seed={4521}
							scale={6}
							octaves={3}
						/>
					</LIC>
				</Duotone>
			</ColorGrade>
		</Canvas>
	);
}
