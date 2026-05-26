# Vignette

A studio portrait drawn inward by a darkened frame — the edges fade into a warm shadow that pulls the eye toward the subject's face. The drop into darkness is gradual, beginning roughly a third of the way out and reaching its deepest at the corners. The center retains the original's tonal range; only the periphery loses light.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/vignette.png)

```tsx
import { Multiply, RadialGradient } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const HEADSHOT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/headshot.jpg";

const W = 1024;
const H = 1024;

export default function Vignette() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<Multiply
				apply={
					<RadialGradient
						width={W}
						height={H}
						radius={0.75}
						stops={[
							{ color: "rgba(255, 255, 255, 1)", position: 0 },
							{ color: "rgba(255, 255, 255, 1)", position: 0.4 },
							{ color: "rgba(40, 25, 15, 1)", position: 1 },
						]}
					/>
				}
			>
				<Image src={HEADSHOT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</Multiply>
		</Canvas>
	);
}
```
