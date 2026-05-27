# Hue Blend Recolor

A portrait whose hue is replaced spatially by a rainbow conic gradient — the original lightness and saturation are kept exactly, but the colour identity of every pixel adopts whatever hue the gradient carries at that location. The face's tonal modelling reads the same, only the colour wheel beneath it has been substituted. Edges between rotational gradient sectors slice through the face as visible colour seams, sweeping different hue identities across forehead, cheek, and jaw.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/hue-blend-recolor.png)

```tsx
import { ConicGradient, Hue } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function HueBlendRecolor() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Hue
				apply={
					<ConicGradient
						width={W}
						height={H}
						centerX={0.5}
						centerY={0.5}
						startAngle={0}
						stops={[
							{ color: "rgb(255, 60, 60)", position: 0 },
							{ color: "rgb(60, 220, 80)", position: 0.33 },
							{ color: "rgb(60, 100, 255)", position: 0.66 },
							{ color: "rgb(255, 60, 60)", position: 1 },
						]}
					/>
				}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Hue>
		</Canvas>
	);
}
```
