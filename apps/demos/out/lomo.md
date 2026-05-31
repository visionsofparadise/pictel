# Lomo

A portrait pushed through the Holga / Lomography aesthetic — the deliberately-flawed plastic-camera look that defined an entire counter-culture photography movement. Heavy black corner vignetting frames the centre subject hard; saturation is cranked so the colours bleed into one another; a cool blue-magenta cast settles into the shadows the way Russian-made plastic lenses bias colour balance; fine grain sits across the frame like cheap drugstore film. The image still reads as a portrait, but as one taken on equipment that was indifferent to fidelity and committed to character — the kind of photograph that would be posted to early-2000s Flickr lomo pools alongside light-leaked Diana-camera shots.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-2.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/lomo.png)

```tsx
import { ColorGrade, Grain, Multiply, RadialGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/portrait-with-background-2.jpg";

const W = 713;
const H = 1024;

export default function Lomo() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.55}
						radius={0.55}
						stops={[
							{ color: "rgba(255, 255, 255, 1)", position: 0 },
							{ color: "rgba(220, 215, 225, 1)", position: 0.5 },
							{ color: "rgba(10, 12, 20, 1)", position: 1 },
						]}
					/>
				}
			>
				<Grain intensity={9} seed={3344}>
					<ColorGrade contrast={1.32} saturation={1.6} temperature={-0.08} tint={-0.06} brightness={1.02}>
						<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
					</ColorGrade>
				</Grain>
			</Multiply>
		</Canvas>
	);
}
```
