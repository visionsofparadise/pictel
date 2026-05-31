# Stage Light

A portrait struck by a single tight stage-spot — a warm hot-centred beam falls on the face, with the surrounding studio backdrop crushing rapidly into stage black as the beam falls off. The fall-off is faster and harder than a classical photographic vignette: a clear circular pool of light, a quick fade to deep shadow, the rest of the frame in near-total darkness. The look of a head-and-shoulders portrait taken under a single Fresnel snoot.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/stage-light.png)

```tsx
import { Multiply, RadialGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function StageLight() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={
					<RadialGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.4}
						radius={0.5}
						stops={[
							{ color: "rgba(255, 240, 220, 1)", position: 0 },
							{ color: "rgba(255, 230, 200, 1)", position: 0.55 },
							{ color: "rgba(180, 140, 110, 1)", position: 0.78 },
							{ color: "rgba(15, 10, 8, 1)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" />
			</Multiply>
		</Canvas>
	);
}
```
