import { ColorGrade, Difference, ProceduralNoise } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1280;
const H = 1280;

export default function DifferenceClouds() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<ColorGrade brightness={1.0} contrast={1.3} saturation={1.6} temperature={0.4} tint={-0.2}>
				<Difference
					apply={
						<ProceduralNoise
							width={W}
							height={H}
							type="perlin"
							seed={3517}
							scale={6}
							octaves={4}
						/>
					}
				>
					<ProceduralNoise
						width={W}
						height={H}
						type="simplex"
						seed={821}
						scale={9}
						octaves={5}
					/>
				</Difference>
			</ColorGrade>
		</Canvas>
	);
}
