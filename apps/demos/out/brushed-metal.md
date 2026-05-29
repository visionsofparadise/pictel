# Brushed Metal

A purely-generated stretch of brushed-aluminium surface — fine parallel scratches running horizontally across a satin-grey panel, the way a wire-wheel finish leaves directional striation on a sheet of polished stainless. The flow is locked to a single horizontal direction (no swirl, no rotation); the value range climbs from a deep gunmetal in the recessed grooves through a satin mid-grey to bright catchlights where the surface catches light. The result reads as a metal panel sample — the kind of swatch a product designer would slot into a CMF moodboard, or a fabricator would specify as "#4 brushed finish."

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/brushed-metal.png)

```tsx
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
```
