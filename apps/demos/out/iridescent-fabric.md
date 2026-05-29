# Iridescent Fabric

A purely-generated stretch of iridescent textile — the kind of holographic-foil cellophane or oil-slicked silk that shifts colour as the angle of view changes. A full-spectrum conic sweep around the centre carries the rainbow hue rotation; a soft off-axis highlight pools where a virtual light would catch the fabric, lifting the colours where it bleeds in; a wider radial darkening rolls the edges toward shadow so the impression is of a curved, semi-glossy surface rather than a flat colour wheel. The result has no subject and no scene — just a chromatic surface texture that could be photographed as a fashion close-up, a record sleeve detail, or a holographic sticker.

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/iridescent-fabric.png)

```tsx
import { ConicGradient, Multiply, RadialGradient, SoftLight } from "@pictel/effects";
import { Canvas } from "pictel";

const W = 1280;
const H = 1280;

export default function IridescentFabric() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.42}
						centerY={0.38}
						radius={0.85}
						stops={[
							{ color: "rgba(255, 255, 255, 1)", position: 0 },
							{ color: "rgba(220, 220, 230, 1)", position: 0.5 },
							{ color: "rgba(50, 45, 60, 1)", position: 1 },
						]}
					/>
				}
			>
				<SoftLight
					apply={
						<RadialGradient
							width={W}
							height={H}
							centerX={0.4}
							centerY={0.35}
							radius={0.4}
							stops={[
								{ color: "rgba(255, 255, 255, 1)", position: 0 },
								{ color: "rgba(180, 180, 180, 0.6)", position: 0.6 },
								{ color: "rgba(80, 80, 80, 0.0)", position: 1 },
							]}
						/>
					}
				>
					<ConicGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.5}
						stops={[
							{ color: "#ff3b8d", position: 0 },
							{ color: "#ff8a30", position: 0.16 },
							{ color: "#ffd732", position: 0.32 },
							{ color: "#3fd370", position: 0.48 },
							{ color: "#34b7ff", position: 0.64 },
							{ color: "#8e54ff", position: 0.8 },
							{ color: "#ff3b8d", position: 1 },
						]}
					/>
				</SoftLight>
			</Multiply>
		</Canvas>
	);
}
```
