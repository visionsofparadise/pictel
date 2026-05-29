# Wood Plank

A purely-generated stretch of clear-grade flatsawn timber — the kind of grain pattern a freshly milled plank of pine or oak shows when you look at the face of the board. Long fine streaks run parallel along the grain direction; a series of darker late-wood density bands cross the board at irregular intervals, each band slightly thicker than the early-wood spans between them; and because the growth-ring centre sits well off the visible face of the plank, the bands sweep across the frame as gentle arcs rather than tight concentric circles. The tonal palette stays in honest warm timber — deep sienna in the late-wood, warm pale wheat through the early-wood, with the grain streaks carrying the per-pixel variation that lifts the surface above a flat stain. No knots and no figure: a clear board, the kind of stock a cabinet-maker reaches for first.

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/wood-plank.png)

```tsx
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
```
