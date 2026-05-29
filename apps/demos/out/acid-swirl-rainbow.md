# Acid Swirl Rainbow

A purely-generated psychedelic vortex — clouds of organic noise pulled into a tangential swirl around the centre of the frame, then remapped through the full visible spectrum from indigo through cyan and green to yellow and magenta. Every band of the rainbow is exercised: the deepest valleys of the swirl resolve to inky indigo, the brightest crests push past yellow into hot magenta, and the smooth turbulent regions between sweep through every hue in between. The form is unmistakably a turbulence vortex (concentric pulls into the centre, undulating streamlines, no rigid geometry) but the colour reads as a poster from a 1968 head-shop wall — the full spectrum saturating the swirl rather than a single-hue duotone wash.

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/acid-swirl-rainbow.png)

```tsx
import { ColorGrade, GradientMap, LIC, ProceduralNoise, VectorField } from "@pictel/effects";
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
					<LIC
						length={20}
						stepSize={1}
						map={<VectorField width={W} height={H} pattern="tangential" />}
					>
						<ProceduralNoise width={W} height={H} type="simplex" seed={7} scale={4} octaves={4} />
					</LIC>
				</ColorGrade>
			</GradientMap>
		</Canvas>
	);
}
```
