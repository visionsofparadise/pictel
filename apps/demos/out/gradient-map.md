# Gradient Map

A portrait pushed into a full cinematic poster grade — every tone remapped along a single curated ramp. The deepest shadows fall to a cold deep-teal, the lower mids climb through plum, the upper mids flush into magenta, and the highlights resolve to a warm cream. The result reads as a graphic, screen-printed colour study rather than a photograph: continuous tonal interpolation, no banding, the original luminance preserved as the only structure carrying through the recolour.

**Before**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg)

**After**

![](https://pictel-demos.s3.us-east-1.amazonaws.com/outputs/gradient-map.png)

```tsx
import { GradientMap } from "@pictel/effects";
import { Canvas, Image } from "pictel";

const PORTRAIT_URL = "https://pictel-demos.s3.us-east-1.amazonaws.com/sources/golden-hour-portrait.jpg";

const W = 1024;
const H = 1536;

export default function GradientMapDemo() {
	return (
		<Canvas mode="display" dimensions={{ width: W, height: H }}>
			<GradientMap
				stops={[
					{ color: "#08252e", position: 0 },
					{ color: "#4a2a6a", position: 0.35 },
					{ color: "#d65d8c", position: 0.7 },
					{ color: "#f7ecd0", position: 1 },
				]}
			>
				<Image src={PORTRAIT_URL} width={W} height={H} fit="cover" crossOrigin="anonymous" />
			</GradientMap>
		</Canvas>
	);
}
```
