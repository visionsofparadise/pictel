# Generative Poster

A poster generated entirely from code — no photograph, no scan, no source plate. A warm radial wash rises from the lower-left like a setting sun, deep magenta-black at the edges into amber at the core, crossed by diagonal silkscreen-style hatching in burnt orange and dusted across the whole surface with a fine simplex grain. The visual rhythm of a printed broadside: gradient, pattern, noise, layered until the surface feels worked rather than rendered.

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/generative-poster.png)

```tsx
import { LinePattern, Overlay, ProceduralNoise, RadialGradient, Screen } from "@pictel/effects";
import { Canvas } from "pictel";

const canvasW = 720;
const canvasH = 960;

export default function GenerativePoster() {
	return (
		<Canvas mode="display" dimensions={{ width: canvasW, height: canvasH }}>
			<Overlay
				apply={
					<ProceduralNoise
						width={canvasW}
						height={canvasH}
						type="simplex"
						seed={101}
						scale={0.5}
					/>
				}
			>
				<Screen
					apply={
						<LinePattern
							width={canvasW}
							height={canvasH}
							seed={5}
							spacing={26}
							thickness={2}
							angle={32}
							color="#e8a13c"
						/>
					}
				>
					<RadialGradient
						width={canvasW}
						height={canvasH}
						stops={[
							{ color: "#f6c970", position: 0 },
							{ color: "#c25a2e", position: 0.45 },
							{ color: "#1a1326", position: 1 },
						]}
						centerX={0.38}
						centerY={0.34}
						radius={0.9}
					/>
				</Screen>
			</Overlay>
		</Canvas>
	);
}
```
